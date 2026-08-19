import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../lib/logger';

export const redisConnection = config.redisUrl
  ? new Redis(config.redisUrl, {
      maxRetriesPerRequest: null, // Required by BullMQ
      tls: config.redisUrl.startsWith('rediss://') ? {} : undefined,
    })
  : new Redis({
      host: config.redisHost,
      port: config.redisPort,
      maxRetriesPerRequest: null, // Required by BullMQ
    });

redisConnection.on('connect', () => {
  logger.info(`⚡ Connected to Redis instance successfully.`);
});

redisConnection.on('error', (err) => {
  logger.error('❌ Redis connection error:', err.message);
});
