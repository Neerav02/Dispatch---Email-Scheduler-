import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../lib/logger';

export const redisConnection = new Redis({
  host: config.redisHost,
  port: config.redisPort,
  maxRetriesPerRequest: null, // Required by BullMQ
});

redisConnection.on('connect', () => {
  logger.info(`⚡ Connected to Redis at ${config.redisHost}:${config.redisPort}`);
});

redisConnection.on('error', (err) => {
  logger.error('❌ Redis connection error:', err.message);
});
