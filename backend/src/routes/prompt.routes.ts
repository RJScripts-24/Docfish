import { Router } from 'express';
import { 
  createPrompt, 
  getPrompts, 
  getActivePrompt, 
  activatePrompt 
} from '../controllers/prompt.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.post('/', createPrompt);
router.get('/', getPrompts);
router.get('/active', getActivePrompt);
router.post('/:id/activate', activatePrompt);

export default router;