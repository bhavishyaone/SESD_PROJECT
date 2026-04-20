import { Router } from 'express';
import { EnrollmentController } from '../controllers/enrollment.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
const enrollmentController = new EnrollmentController();

router.post('/', authMiddleware, roleMiddleware('student'), enrollmentController.enroll);
router.get('/', authMiddleware, enrollmentController.list);
router.get('/course/:courseId', authMiddleware, roleMiddleware('instructor'), enrollmentController.listByCourse);
// IMPORTANT: Specific routes MUST come before wildcard /:id to avoid Express
// matching /lessons/progress or /course/:courseId/progress as an :id param.
router.get('/lessons/progress', authMiddleware, enrollmentController.getLessonProgress);
router.post('/lessons/:lessonId/complete', authMiddleware, roleMiddleware('student'), enrollmentController.completeLesson);
router.post('/course/:courseId/progress', authMiddleware, roleMiddleware('student'), enrollmentController.postLessonProgress);
router.get('/:id', authMiddleware, enrollmentController.get);
router.patch('/:id/progress', authMiddleware, enrollmentController.updateProgress);

export default router;
