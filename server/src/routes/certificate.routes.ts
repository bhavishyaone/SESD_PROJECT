import { Router } from 'express';
import { CertificateController } from '../controllers/certificate.controller';

const router = Router();
const certificateController = new CertificateController();

router.post('/generate', certificateController.generate);
router.get('/:id', certificateController.get);

export default router;
