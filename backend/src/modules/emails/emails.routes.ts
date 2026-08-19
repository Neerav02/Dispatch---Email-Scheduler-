import { Router } from 'express';
import { emailsController } from './emails.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.use(requireAuth as any);
router.get('/', emailsController.getEmails as any);
router.get('/runway', emailsController.getRunway as any);
router.get('/rate-limit/usage', emailsController.getRateLimitUsage as any);

export default router;
