import { Router } from 'express';
import { EnrollmentController } from '../controllers/enrollment.controller';

const router = Router();
const enrollmentController = new EnrollmentController();

router.post('/', enrollmentController.enroll);
router.get('/:id', enrollmentController.get);

export default router;
