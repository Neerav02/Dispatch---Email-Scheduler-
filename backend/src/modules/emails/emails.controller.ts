import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { prisma } from '../../db/client';
import { redisConnection } from '../../queue/connection';
import { Status } from '@prisma/client';

export const emailsController = {
  getEmails: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const statusParam = req.query.status as string;
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '20', 10);
      const skip = (page - 1) * limit;

      let statusFilter: Status[] = [];
      if (statusParam === 'scheduled' || statusParam === 'queued' || statusParam === 'holding') {
        statusFilter = ['queued', 'holding', 'in_flight'];
      } else if (statusParam === 'sent' || statusParam === 'failed') {
        statusFilter = ['sent', 'failed'];
      } else if (statusParam) {
        statusFilter = [statusParam as Status];
      }

      const whereClause = {
        campaign: { userId },
        ...(statusFilter.length > 0 ? { status: { in: statusFilter } } : {}),
      };

      const [emails, total] = await Promise.all([
        prisma.scheduledEmail.findMany({
          where: whereClause,
          include: {
            campaign: {
              select: {
                subject: true,
                body: true,
                sender: { select: { label: true, smtpFrom: true } },
              },
            },
          },
          orderBy: { sendAt: statusParam?.includes('sent') ? 'desc' : 'asc' },
          skip,
          take: limit,
        }),
        prisma.scheduledEmail.count({ where: whereClause }),
      ]);

      return res.json({
        data: emails,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      return res.status(500).json({ error: { code: 'GET_EMAILS_FAILED', message: error.message } });
    }
  },

  getRunway: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const now = new Date();
      // Look back 10 minutes and forward 2 hours for active flight visualization
      const windowStart = new Date(now.getTime() - 10 * 60 * 1000);
      const windowEnd = new Date(now.getTime() + 120 * 60 * 1000);

      const runwayEmails = await prisma.scheduledEmail.findMany({
        where: {
          campaign: { userId },
          OR: [
            { status: { in: ['queued', 'in_flight', 'holding'] } },
            {
              status: { in: ['sent', 'failed'] },
              sendAt: { gte: windowStart, lte: windowEnd },
            },
          ],
        },
        include: {
          campaign: {
            select: {
              subject: true,
              sender: { select: { label: true } },
            },
          },
        },
        orderBy: { sendAt: 'asc' },
        take: 50, // Top 50 flight capsules on the runway
      });

      return res.json({
        data: runwayEmails,
        timestamp: now.toISOString(),
      });
    } catch (error: any) {
      return res.status(500).json({ error: { code: 'GET_RUNWAY_FAILED', message: error.message } });
    }
  },

  getRateLimitUsage: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { senderId } = req.query;
      const userId = req.user!.id;

      let sender = null;
      if (senderId) {
        sender = await prisma.sender.findFirst({
          where: { id: String(senderId), userId },
        });
      } else {
        sender = await prisma.sender.findFirst({
          where: { userId },
          orderBy: { createdAt: 'asc' },
        });
      }

      if (!sender) {
        return res.json({
          data: {
            currentCount: 0,
            maxPerHour: 200,
            remaining: 200,
            percentUsed: 0,
          },
        });
      }

      const now = new Date();
      const currentHourKey = `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}:${now.getUTCHours()}`;
      const rateKey = `rate:${sender.id}:${currentHourKey}`;

      const rawCount = await redisConnection.get(rateKey);
      const currentCount = rawCount ? parseInt(rawCount, 10) : 0;
      const maxPerHour = sender.maxPerHour || 200;
      const remaining = Math.max(0, maxPerHour - currentCount);
      const percentUsed = Math.min(100, Math.round((currentCount / maxPerHour) * 100));

      return res.json({
        data: {
          senderId: sender.id,
          senderLabel: sender.label,
          currentCount,
          maxPerHour,
          remaining,
          percentUsed,
          currentHourKey,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ error: { code: 'GET_RATE_LIMIT_FAILED', message: error.message } });
    }
  },
};
