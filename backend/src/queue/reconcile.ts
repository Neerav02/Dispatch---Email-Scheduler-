import { Queue } from 'bullmq';
import { prisma } from '../db/client';
import { logger } from '../lib/logger';
import { EmailJobData } from './email.queue';

export async function reconcileOnBoot(queue: Queue<EmailJobData>): Promise<void> {
  logger.info('🔄 Starting database reconciliation pass (reconcileOnBoot)...');

  try {
    // Grace period of 1 hour in the past to capture missed jobs during crash downtime
    const graceCutoff = new Date(Date.now() - 60 * 60 * 1000);

    const pendingEmails = await prisma.scheduledEmail.findMany({
      where: {
        status: { in: ['queued', 'holding'] },
        sendAt: { gte: graceCutoff },
      },
    });

    logger.info(`🔍 Found ${pendingEmails.length} pending scheduled email(s) in database to reconcile.`);

    let enqueuedCount = 0;
    for (const email of pendingEmails) {
      const now = Date.now();
      const sendAtTime = new Date(email.sendAt).getTime();
      const delay = Math.max(0, sendAtTime - now);

      try {
        await queue.add(
          'send-email',
          { emailId: email.id },
          {
            jobId: email.id, // Deterministic deduplication key
            delay,
          }
        );
        enqueuedCount++;
      } catch (err: any) {
        // BullMQ throws error or ignores if jobId already exists in queue
        logger.debug(`Job ${email.id} already exists in queue or failed to add:`, err?.message);
      }
    }

    logger.info(`✅ Reconciliation complete. Enqueued/verified ${enqueuedCount} jobs in BullMQ.`);
  } catch (error) {
    logger.error('❌ Reconciliation pass encountered an error:', error);
  }
}
