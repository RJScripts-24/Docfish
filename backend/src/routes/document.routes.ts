import { Router } from 'express';
import { 
  uploadInvoices, 
  getInvoices, 
  getInvoiceById, 
  reprocessInvoice,
  updateInvoiceCorrections,
} from '../controllers/document.controller';
import { protect } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.use(protect);

router.post(
  '/',
  upload.fields([
    { name: 'files', maxCount: 50 },
    { name: 'file', maxCount: 1 },
  ]),
  uploadInvoices
);
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.post('/reprocess/:id', reprocessInvoice);
router.patch('/:id', updateInvoiceCorrections);

export default router;