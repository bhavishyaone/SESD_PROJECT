import { Router } from 'express';
import { GradingController } from '../controllers/grading.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
const gradingController = new GradingController();

router.post('/evaluate', authMiddleware, roleMiddleware('instructor'), gradingController.evaluate);

export default router;
