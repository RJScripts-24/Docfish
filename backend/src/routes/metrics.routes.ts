import { Router } from 'express';
import { getErrorReport, getMetrics } from '../controllers/metrics.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', getMetrics);
router.get('/errors', getErrorReport);

export default router;