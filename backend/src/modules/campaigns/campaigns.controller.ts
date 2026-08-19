import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { prisma } from '../../db/client';
import { emailQueue } from '../../queue/email.queue';
import { logger } from '../../lib/logger';
import { z } from 'zod';

const createCampaignSchema = z.object({
  senderId: z.string().uuid('Invalid sender ID'),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Email body is required'),
  recipients: z.array(z.string().email('Invalid recipient email address')).min(1, 'At least 1 recipient is required'),
  startTime: z.string().transform((val) => new Date(val)),
  delayMs: z.number().min(100).default(1000),
  maxPerHour: z.number().min(1).max(10000).default(200),
});

export const campaignsController = {
  createCampaign: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const parseResult = createCampaignSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: parseResult.error.errors[0]?.message || 'Invalid campaign parameters',
          },
        });
      }

      const { senderId, subject, body, recipients, startTime, delayMs, maxPerHour } = parseResult.data;

      // Verify sender exists and belongs to user
      const sender = await prisma.sender.findFirst({
        where: { id: senderId, userId },
      });

      if (!sender) {
        return res.status(404).json({
          error: {
            code: 'SENDER_NOT_FOUND',
            message: 'Selected sender identity does not exist or does not belong to you.',
          },
        });
      }

      const startMs = startTime.getTime();
      const nowMs = Date.now();

      // Compute individual pre-assigned sendAt timestamps with hourly window spillover
      const emailInserts = recipients.map((recipient, i) => {
        const hourWindowIndex = Math.floor(i / maxPerHour);
        const hourOffsetMs = hourWindowIndex * 3600 * 1000;
        const sendAtMs = startMs + (i * delayMs) + hourOffsetMs;

        return {
          recipient,
          sendAt: new Date(sendAtMs),
          status: 'queued' as const,
        };
      });

      // Execute atomic DB transaction
      const campaign = await prisma.$transaction(async (tx) => {
        const newCampaign = await tx.campaign.create({
          data: {
            userId,
            senderId,
            subject,
            body,
            startTime,
            delayMs,
            maxPerHour,
          },
        });

        await tx.scheduledEmail.createMany({
          data: emailInserts.map((e) => ({
            ...e,
            campaignId: newCampaign.id,
          })),
        });

        return newCampaign;
      });

      // Fetch created scheduled email records to get their database IDs for BullMQ enqueueing
      const createdEmails = await prisma.scheduledEmail.findMany({
        where: { campaignId: campaign.id },
        select: { id: true, sendAt: true },
      });

      // Enqueue BullMQ delayed jobs with deterministic jobId = scheduled_email.id
      let enqueuedCount = 0;
      for (const email of createdEmails) {
        const sendAtTime = new Date(email.sendAt).getTime();
        const delay = Math.max(0, sendAtTime - nowMs);

        try {
          await emailQueue.add(
            'send-email',
            { emailId: email.id },
            {
              jobId: email.id, // Deterministic idempotency key
              delay,
            }
          );
          enqueuedCount++;
        } catch (err: any) {
          logger.warn(`BullMQ duplicate enqueue skipped for job ${email.id}:`, err?.message);
        }
      }

      logger.info(`✨ Successfully created campaign ${campaign.id} with ${createdEmails.length} recipients. Enqueued ${enqueuedCount} jobs.`);

      return res.status(201).json({
        data: {
          campaignId: campaign.id,
          totalRecipients: createdEmails.length,
          enqueuedJobs: enqueuedCount,
          firstSendAt: createdEmails[0]?.sendAt,
          lastSendAt: createdEmails[createdEmails.length - 1]?.sendAt,
        },
      });
    } catch (error: any) {
      logger.error('Failed to create campaign:', error);
      return res.status(500).json({ error: { code: 'CAMPAIGN_CREATE_FAILED', message: error.message } });
    }
  },
};
