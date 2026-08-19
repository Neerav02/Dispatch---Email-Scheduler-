import { emailWorker } from './queue/email.worker';
import { emailQueue } from './queue/email.queue';
import { reconcileOnBoot } from './queue/reconcile';
import { logger } from './lib/logger';

async function startWorkerProcess() {
  logger.info('⚡ Starting Dispatch BullMQ Worker Process...');

  try {
    // Run self-healing boot reconciliation pass
    await reconcileOnBoot(emailQueue);

    logger.info('🟢 Dispatch BullMQ Worker process is active and listening for delayed jobs.');
  } catch (error) {
    logger.error('❌ Failed to initialize worker process:', error);
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

startWorkerProcess();
