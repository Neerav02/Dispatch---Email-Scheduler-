import { Worker, Job } from 'bullmq';
import { EMAIL_QUEUE_NAME, EmailJobData } from './email.queue';
import { redisConnection } from './connection';
import { prisma } from '../db/client';
import { logger } from '../lib/logger';
import { sendEmail } from '../lib/mailer';

export const emailWorker = new Worker<EmailJobData>(
  EMAIL_QUEUE_NAME,
  async (job: Job<EmailJobData>) => {
    const { emailId } = job.data;
    logger.info(`🛫 Processing email job ${job.id} (Email ID: ${emailId})`);

    // 1. Fetch scheduled email details from Postgres (Source of Truth)
    const emailRecord = await prisma.scheduledEmail.findUnique({
      where: { id: emailId },
      include: {
        campaign: {
          include: {
            sender: true,
          },
        },
      },
    });

    if (!emailRecord) {
      logger.warn(`⚠️ Email record ${emailId} not found in PostgreSQL. Skipping job.`);
      return;
    }

    // Idempotency check: if already sent, ack without re-sending
    if (emailRecord.status === 'sent') {
      logger.info(`ℹ️ Email ${emailId} is already marked as 'sent' in DB. Skipping duplicate send.`);
      return;
    }

    const sender = emailRecord.campaign.sender;
    const maxPerHour = emailRecord.campaign.maxPerHour || sender.maxPerHour || 200;

    // 2. Atomic Rate Limiter Check in Redis
    const now = new Date();
    const currentHourKey = `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}:${now.getUTCHours()}`;
    const rateKey = `rate:${sender.id}:${currentHourKey}`;

    const currentCount = await redisConnection.incr(rateKey);
    if (currentCount === 1) {
      // Set TTL to expire at top of next hour (max 3600s)
      await redisConnection.expire(rateKey, 3600);
    }

    if (currentCount > maxPerHour) {
      logger.warn(`⚠️ Sender ${sender.label} reached hourly cap (${currentCount}/${maxPerHour}). Rescheduling email ${emailId} to holding pattern.`);

      // Update Postgres status to 'holding'
      await prisma.scheduledEmail.update({
        where: { id: emailId },
        data: {
          status: 'holding',
          heldReason: `Hourly cap reached (${currentCount}/${maxPerHour}). Rescheduled to next hour window.`,
        },
      });

      // Compute timestamp for next hour window start
      const nextHour = new Date(now);
      nextHour.setUTCHours(nextHour.getUTCHours() + 1, 0, 0, 0);
      const delayToNextHour = Math.max(1000, nextHour.getTime() - Date.now());

      // Reschedule job in BullMQ
      await job.moveToDelayed(Date.now() + delayToNextHour, job.token);
      return;
    }

    // 3. Mark as in_flight
    await prisma.scheduledEmail.update({
      where: { id: emailId },
      data: { status: 'in_flight' },
    });

    // 4. Execute SMTP Send via Ethereal Mailer
    try {
      const sendResult = await sendEmail({
        from: `"${sender.label}" <${sender.smtpFrom}>`,
        to: emailRecord.recipient,
        subject: emailRecord.campaign.subject,
        html: emailRecord.campaign.body,
      });

      // Update PostgreSQL to 'sent'
      await prisma.scheduledEmail.update({
        where: { id: emailId },
        data: {
          status: 'sent',
          sentAt: new Date(),
          etherealUrl: sendResult.previewUrl,
          errorMessage: null,
          heldReason: null,
        },
      });

      logger.info(`✅ Email ${emailId} successfully sent to ${emailRecord.recipient}. Preview URL: ${sendResult.previewUrl || 'N/A'}`);
    } catch (sendError: any) {
      logger.error(`❌ Send failure for email ${emailId}:`, sendError);

      await prisma.scheduledEmail.update({
        where: { id: emailId },
        data: {
          status: 'failed',
          errorMessage: sendError?.message || 'SMTP delivery failed',
        },
      });

      throw sendError; // Triggers BullMQ retry backoff
    }
  },
  {
    connection: redisConnection,
    concurrency: 5, // Process up to 5 jobs concurrently
  }
);

emailWorker.on('completed', (job) => {
  logger.info(`✨ Job ${job.id} completed successfully.`);
});

emailWorker.on('failed', (job, err) => {
  logger.error(`💥 Job ${job?.id} failed with error: ${err.message}`);
});
