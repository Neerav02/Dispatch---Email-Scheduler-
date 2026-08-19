import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../db/client';
import { config } from '../../config';
import { logger } from '../../lib/logger';
import { AuthenticatedRequest } from '../../middleware/auth';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const authController = {
  // Register with Email & Password
  register: async (req: Request, res: Response) => {
    try {
      const parseResult = registerSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: parseResult.error.errors[0]?.message || 'Invalid input data',
          },
        });
      }

      const { name, email, password } = parseResult.data;
      const normalizedEmail = email.toLowerCase().trim();

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        return res.status(400).json({
          error: {
            code: 'EMAIL_IN_USE',
            message: 'An account with this email address already exists. Please sign in.',
          },
        });
      }

      // Hash password securely with bcrypt
      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email: normalizedEmail,
          passwordHash,
        },
      });

      // Generate JWT Token
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      res.cookie('dispatch_session', token, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      logger.info(`✅ Registered new user account: ${user.email}`);

      return res.status(201).json({
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
          },
          token,
        },
      });
    } catch (error: any) {
      logger.error('Registration failed:', error);
      return res.status(500).json({ error: { code: 'REGISTRATION_FAILED', message: error.message } });
    }
  },

  // Login with Email & Password
  login: async (req: Request, res: Response) => {
    try {
      const parseResult = loginSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: parseResult.error.errors[0]?.message || 'Invalid email or password format',
          },
        });
      }

      const { email, password } = parseResult.data;
      const normalizedEmail = email.toLowerCase().trim();

      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        return res.status(401).json({
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password. Please check your credentials.',
          },
        });
      }

      if (user.passwordHash) {
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
          return res.status(401).json({
            error: {
              code: 'INVALID_CREDENTIALS',
              message: 'Invalid email or password. Please check your credentials.',
            },
          });
        }
      }

      // Generate JWT Token
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      res.cookie('dispatch_session', token, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      logger.info(`🔑 User logged in: ${user.email}`);

      return res.json({
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
          },
          token,
        },
      });
    } catch (error: any) {
      logger.error('Login failed:', error);
      return res.status(500).json({ error: { code: 'LOGIN_FAILED', message: error.message } });
    }
  },

  // Instant Demo Sandbox Mode Login
  demoLogin: async (req: Request, res: Response) => {
    try {
      let demoUser = await prisma.user.findFirst({
        where: { email: 'demo.controller@dispatch.tower' },
      });

      if (!demoUser) {
        demoUser = await prisma.user.create({
          data: {
            googleId: 'demo-google-id-001',
            email: 'demo.controller@dispatch.tower',
            name: 'Demo Tower Controller',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          },
        });

        await prisma.sender.create({
          data: {
            userId: demoUser.id,
            label: 'Aerovox Alpha Flight Operations',
            smtpFrom: 'dispatch-alpha@outbound.tower',
            maxPerHour: 200,
          },
        });
      }

      const token = jwt.sign(
        { id: demoUser.id, email: demoUser.email, name: demoUser.name },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      res.cookie('dispatch_session', token, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        data: {
          user: {
            id: demoUser.id,
            name: demoUser.name,
            email: demoUser.email,
            avatarUrl: demoUser.avatarUrl,
          },
          token,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ error: { code: 'DEMO_LOGIN_FAILED', message: error.message } });
    }
  },

  // Google OAuth Success Callback Handler
  googleCallback: async (req: Request, res: Response) => {
    const targetFrontend =
      config.frontendUrl && config.frontendUrl !== 'http://localhost:3000'
        ? config.frontendUrl
        : 'https://dispatch-email-scheduler.vercel.app';

    try {
      const user = req.user as any;
      if (!user) {
        return res.redirect(`${targetFrontend}/login?error=oauth_failed`);
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      res.cookie('dispatch_session', token, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.redirect(`${targetFrontend}/dashboard`);
    } catch (error: any) {
      logger.error('Google callback error:', error);
      return res.redirect(`${targetFrontend}/login?error=oauth_failed`);
    }
  },

  // Get Current Authenticated User Metadata
  getCurrentUser: async (req: AuthenticatedRequest, res: Response) => {
    return res.json({ data: req.user });
  },

  // Logout
  logout: async (req: Request, res: Response) => {
    res.clearCookie('dispatch_session');
    return res.json({ data: { message: 'Signed out successfully' } });
  },
};
