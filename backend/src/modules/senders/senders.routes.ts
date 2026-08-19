import { Router } from 'express';
import { sendersController } from './senders.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.use(requireAuth as any);
router.get('/', sendersController.getSenders as any);
router.post('/', sendersController.createSender as any);

export default router;
