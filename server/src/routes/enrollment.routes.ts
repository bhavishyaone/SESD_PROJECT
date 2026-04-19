import { Router } from 'express';
import { EnrollmentController } from '../controllers/enrollment.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
const enrollmentController = new EnrollmentController();

router.post('/', authMiddleware, roleMiddleware('student'), enrollmentController.enroll);
router.get('/', authMiddleware, enrollmentController.list);
router.get('/course/:courseId', authMiddleware, roleMiddleware('instructor'), enrollmentController.listByCourse);
router.get('/:id', authMiddleware, enrollmentController.get);
router.patch('/:id/progress', authMiddleware, enrollmentController.updateProgress);
router.post('/lessons/:lessonId/complete', authMiddleware, roleMiddleware('student'), enrollmentController.completeLesson);
router.post('/course/:courseId/progress', authMiddleware, roleMiddleware('student'), enrollmentController.postLessonProgress);
router.get('/lessons/progress', authMiddleware, enrollmentController.getLessonProgress);

export default router;
