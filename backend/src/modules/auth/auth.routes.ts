import { Router } from 'express';
import passport from 'passport';
import { authController } from './auth.controller';
import { requireAuth } from '../../middleware/auth';
import { config } from '../../config';

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
  (req, res, next) => {
    passport.authenticate('google', { failureRedirect: `${config.frontendUrl}/login?error=oauth_failed`, session: false })(req, res, next);
  },
  authController.googleCallback
);

export default router;
