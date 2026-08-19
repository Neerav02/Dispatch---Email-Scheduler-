import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { prisma } from '../../db/client';
import { redisConnection } from '../../queue/connection';

export const vaultController = {
  getStorageTelemetry: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      const [usersCount, sendersCount, campaignsCount, scheduledEmailsCount, sentEmailsCount, holdingEmailsCount] = await Promise.all([
        prisma.user.count(),
        prisma.sender.count({ where: { userId } }),
        prisma.campaign.count({ where: { userId } }),
        prisma.scheduledEmail.count({ where: { campaign: { userId } } }),
        prisma.scheduledEmail.count({ where: { campaign: { userId }, status: 'sent' } }),
        prisma.scheduledEmail.count({ where: { campaign: { userId }, status: 'holding' } }),
      ]);

      // Fetch sample recent database records for live transparency
      const recentUsers = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, createdAt: true },
      });

      const recentSenders = await prisma.sender.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, label: true, smtpFrom: true, maxPerHour: true, createdAt: true },
      });

      const recentEmails = await prisma.scheduledEmail.findMany({
        where: { campaign: { userId } },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { campaign: { select: { subject: true } } },
      });

      // Get Redis key metrics
      const redisKeys = await redisConnection.keys('rate:*');
      const rateLimitTelemetry = [];
      for (const key of redisKeys.slice(0, 10)) {
        const value = await redisConnection.get(key);
        const ttl = await redisConnection.ttl(key);
        rateLimitTelemetry.push({ key, value: value || '0', ttlSeconds: ttl });
      }

      return res.json({
        data: {
          storageEngine: {
            primaryDatabase: 'PostgreSQL 16 (Relational Schema Source of Truth)',
            queueEngine: 'Redis 7 + BullMQ (Deterministic Job Execution)',
            connectionHost: 'localhost:5433 (PostgreSQL) & localhost:6380 (Redis)',
          },
          counts: {
            usersCount,
            sendersCount,
            campaignsCount,
            scheduledEmailsCount,
            sentEmailsCount,
            holdingEmailsCount,
          },
          liveRecords: {
            users: recentUsers,
            senders: recentSenders,
            recentEmails,
            redisRateKeys: rateLimitTelemetry,
          },
        },
      });
    } catch (error: any) {
      return res.status(500).json({ error: { code: 'VAULT_TELEMETRY_FAILED', message: error.message } });
    }
  },
};
