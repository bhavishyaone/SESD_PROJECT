import { Router } from 'express';
import { CertificateController } from '../controllers/certificate.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
const certificateController = new CertificateController();

router.post('/generate', authMiddleware, roleMiddleware('instructor', 'admin'), certificateController.generate);
router.get('/', authMiddleware, certificateController.list);
router.get('/:id', authMiddleware, certificateController.get);

export default router;
