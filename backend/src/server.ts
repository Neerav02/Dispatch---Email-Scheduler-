import { app } from './app';
import { config } from './config';
import { logger } from './lib/logger';
import { emailQueue } from './queue/email.queue';
import { reconcileOnBoot } from './queue/reconcile';

async function startServer() {
  try {
    // Run self-healing boot reconciliation pass
    await reconcileOnBoot(emailQueue);

    app.listen(config.port, () => {
      logger.info(`🚀 Dispatch Tower Express API listening on port ${config.port} [${config.nodeEnv}]`);
      logger.info(`📡 Health Check URL: http://localhost:${config.port}/health`);
    });
  } catch (error) {
    logger.error('❌ Failed to start Dispatch API server:', error);
    process.exit(1);
  }
}

startServer();
