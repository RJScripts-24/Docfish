import { Router } from 'express';
import { getMetrics } from '../controllers/metrics.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', getMetrics);

export default router;