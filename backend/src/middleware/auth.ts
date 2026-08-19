import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../db/client';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    googleId?: string | null;
    email: string;
    name: string;
    avatarUrl?: string | null;
  };
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.dispatch_session || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      // Check for Demo Mode fallback header or query parameter
      const isDemo = req.headers['x-demo-mode'] === 'true' || req.query.demo === 'true';
      if (isDemo) {
        let demoUser = await prisma.user.findFirst({ where: { email: 'demo.controller@dispatch.tower' } });
        if (!demoUser) {
          demoUser = await prisma.user.create({
            data: {
              googleId: 'demo-google-id-001',
              email: 'demo.controller@dispatch.tower',
              name: 'Demo Tower Controller',
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            },
          });
        }
        req.user = demoUser;
        return next();
      }

      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Please sign in to access the dispatch tower console.',
        },
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret) as { id?: string; userId?: string };
    const targetUserId = decoded.id || decoded.userId;

    if (!targetUserId) {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token payload missing user ID.',
        },
      });
    }

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });

    if (!user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_SESSION',
          message: 'User session is invalid or expired. Please sign in again.',
        },
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      error: {
        code: 'EXPIRED_TOKEN',
        message: 'Session token has expired. Please sign in to continue.',
      },
    });
  }
}
