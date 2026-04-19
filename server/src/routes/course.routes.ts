import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
const courseController = new CourseController();

router.get('/', authMiddleware, courseController.getAll);
router.post('/', authMiddleware, roleMiddleware('instructor'), courseController.create);
router.get('/:id', authMiddleware, courseController.get);
router.patch('/:id', authMiddleware, roleMiddleware('instructor'), courseController.update);
router.patch('/:id/publish', authMiddleware, roleMiddleware('instructor'), courseController.publish);
router.delete('/:id', authMiddleware, roleMiddleware('instructor'), courseController.delete);
router.get('/:id/assignments', authMiddleware, courseController.getCourseAssignments);

router.post('/:id/modules', authMiddleware, roleMiddleware('instructor'), courseController.createModule);
router.get('/:id/modules', authMiddleware, courseController.getModules);
router.delete('/:id/modules/:moduleId', authMiddleware, roleMiddleware('instructor'), courseController.deleteModule);

router.post('/modules/:moduleId/lessons', authMiddleware, roleMiddleware('instructor'), courseController.createLesson);
router.get('/modules/:moduleId/lessons', authMiddleware, courseController.getLessons);
router.delete('/modules/:moduleId/lessons/:lessonId', authMiddleware, roleMiddleware('instructor'), courseController.deleteLesson);

router.get('/instructor/dashboard-stats', authMiddleware, roleMiddleware('instructor', 'admin'), courseController.getInstructorDashboardStats);
router.get('/:id/enrollments', authMiddleware, roleMiddleware('instructor', 'admin'), courseController.getCourseEnrollments);

export default router;
