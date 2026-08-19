import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { prisma } from '../../db/client';
import { z } from 'zod';

const createSenderSchema = z.object({
  label: z.string().min(2, 'Sender label is required'),
  smtpFrom: z.string().email('Invalid sender email address'),
  maxPerHour: z.number().min(1).max(10000).default(200),
});

export const sendersController = {
  getSenders: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      let senders = await prisma.sender.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      // Auto-create default sender if user has none
      if (senders.length === 0) {
        const defaultSender = await prisma.sender.create({
          data: {
            userId,
            label: `${req.user!.name}'s Primary Outbound`,
            smtpFrom: req.user!.email,
            maxPerHour: 200,
          },
        });
        senders = [defaultSender];
      }

      return res.json({ data: senders });
    } catch (error: any) {
      return res.status(500).json({ error: { code: 'GET_SENDERS_FAILED', message: error.message } });
    }
  },

  createSender: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const parseResult = createSenderSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: parseResult.error.errors[0]?.message || 'Invalid sender input',
          },
        });
      }

      const sender = await prisma.sender.create({
        data: {
          userId,
          label: parseResult.data.label,
          smtpFrom: parseResult.data.smtpFrom,
          maxPerHour: parseResult.data.maxPerHour,
        },
      });

      return res.status(201).json({ data: sender });
    } catch (error: any) {
      return res.status(500).json({ error: { code: 'CREATE_SENDER_FAILED', message: error.message } });
    }
  },
};
