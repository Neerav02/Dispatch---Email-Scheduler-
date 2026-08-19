import { app } from './app';
import { config } from './config';
import { logger } from './lib/logger';
import { emailQueue } from './queue/email.queue';
import { emailWorker } from './queue/email.worker';
import { reconcileOnBoot } from './queue/reconcile';

async function startServer() {
  try {
    // Run self-healing boot reconciliation pass
    await reconcileOnBoot(emailQueue);

    app.listen(config.port, () => {
      logger.info(`🚀 Dispatch Tower Express API & BullMQ Worker listening on port ${config.port} [${config.nodeEnv}]`);
      logger.info(`📡 Health Check URL: http://localhost:${config.port}/health`);
    });
  } catch (error) {
    logger.error('❌ Failed to start Dispatch API server:', error);
    process.exit(1);
  }
}

// Graceful Shutdown Handlers
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Closing worker...');
  await emailWorker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Closing worker...');
  await emailWorker.close();
  process.exit(0);
});

startServer();
