import { Queue } from 'bullmq';
import { redisConnection } from './connection';

export const EMAIL_QUEUE_NAME = 'email-dispatch';

export interface EmailJobData {
  emailId: string;
}

export const emailQueue = new Queue<EmailJobData>(EMAIL_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 500, // Keep last 500 completed jobs for audit
    removeOnFail: 1000,
  },
});
