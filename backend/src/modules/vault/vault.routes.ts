import { Router } from 'express';
import { vaultController } from './vault.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.use(requireAuth as any);
router.get('/', vaultController.getStorageTelemetry);

export default router;
