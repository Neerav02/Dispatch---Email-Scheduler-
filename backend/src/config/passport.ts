import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { config } from './index';
import { prisma } from '../db/client';
import { logger } from '../lib/logger';

if (config.google.clientId && config.google.clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackUrl,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in Google OAuth profile'), false);
          }

          let user = await prisma.user.findFirst({
            where: {
              OR: [{ googleId: profile.id }, { email }],
            },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                name: profile.displayName || email.split('@')[0],
                googleId: profile.id,
                avatarUrl: profile.photos?.[0]?.value || null,
              },
            });
            logger.info(`✨ Created new user via Google OAuth: ${email}`);
          } else if (!user.googleId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                googleId: profile.id,
                avatarUrl: profile.photos?.[0]?.value || user.avatarUrl,
              },
            });
            logger.info(`🔗 Linked existing user account to Google OAuth: ${email}`);
          }

          return done(null, user);
        } catch (error) {
          logger.error('Error during Google OAuth verification:', error);
          return done(error as Error, false);
        }
      }
    )
  );
  logger.info('🔑 Google OAuth 2.0 Passport Strategy configured & active.');
} else {
  logger.warn('⚠️ GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing. Google OAuth disabled.');
}

export default passport;
