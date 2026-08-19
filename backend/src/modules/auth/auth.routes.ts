import { Router } from 'express';
import passport from 'passport';
import { authController } from './auth.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

// Email / Password Registration & Login
router.post('/register', authController.register);
router.post('/login', authController.login);

// Instant Sandbox / Demo Login
router.post('/demo', authController.demoLogin);

// Current User Metadata
router.get('/me', requireAuth as any, authController.getCurrentUser as any);

// Logout
router.post('/logout', authController.logout);

// Google OAuth 2.0 routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login?error=oauth_failed', session: false }),
  authController.googleCallback
);

export default router;
