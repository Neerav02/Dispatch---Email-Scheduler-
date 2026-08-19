import { Router } from 'express';
import { emailsController } from './emails.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.use(requireAuth as any);
router.get('/', emailsController.getEmails);
router.get('/runway', emailsController.getRunway);
router.get('/rate-limit/usage', emailsController.getRateLimitUsage);

export default router;
