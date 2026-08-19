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
router.get('/google', (req, res, next) => {
  if (!config.google.clientId || !config.google.clientSecret) {
    return res.status(400).json({
      error: {
        code: 'GOOGLE_AUTH_DISABLED',
        message: 'Google OAuth is not configured on the server. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your Render environment variables.',
      },
    });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get(
  '/google/callback',
  (req, res, next) => {
    if (!config.google.clientId || !config.google.clientSecret) {
      return res.redirect(`${config.frontendUrl}/login?error=google_auth_disabled`);
    }
    passport.authenticate('google', { failureRedirect: `${config.frontendUrl}/login?error=oauth_failed`, session: false })(req, res, next);
  },
  authController.googleCallback
);

export default router;
