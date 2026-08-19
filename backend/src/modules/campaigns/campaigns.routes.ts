import { Router } from 'express';
import { campaignsController } from './campaigns.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.use(requireAuth as any);
router.post('/', campaignsController.createCampaign);

export default router;
