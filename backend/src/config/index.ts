import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().optional().default(''),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
  GOOGLE_CALLBACK_URL: z.string().default('http://localhost:5000/api/auth/google/callback'),
  JWT_SECRET: z.string().default('dispatch-super-secret-jwt-token-key-2026'),
  DEFAULT_MAX_PER_HOUR: z.string().default('200'),
  DEFAULT_MIN_DELAY_MS: z.string().default('1000'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const config = {
  port: parseInt(parsedEnv.data.PORT, 10),
  nodeEnv: parsedEnv.data.NODE_ENV,
  frontendUrl: parsedEnv.data.FRONTEND_URL,
  databaseUrl: parsedEnv.data.DATABASE_URL,
  redisUrl: parsedEnv.data.REDIS_URL,
  redisHost: parsedEnv.data.REDIS_HOST,
  redisPort: parseInt(parsedEnv.data.REDIS_PORT, 10),
  google: {
    clientId: parsedEnv.data.GOOGLE_CLIENT_ID,
    clientSecret: parsedEnv.data.GOOGLE_CLIENT_SECRET,
    callbackUrl: parsedEnv.data.GOOGLE_CALLBACK_URL,
  },
  jwtSecret: parsedEnv.data.JWT_SECRET,
  defaultMaxPerHour: parseInt(parsedEnv.data.DEFAULT_MAX_PER_HOUR, 10),
  defaultMinDelayMs: parseInt(parsedEnv.data.DEFAULT_MIN_DELAY_MS, 10),
};
