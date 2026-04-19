import { Router } from 'express';
import { AssignmentController } from '../controllers/assignment.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();
const assignmentController = new AssignmentController();

router.post('/', authMiddleware, roleMiddleware('instructor'), assignmentController.create);
router.post('/submit', authMiddleware, roleMiddleware('student'), assignmentController.submit);
router.get('/instructor-stats', authMiddleware, roleMiddleware('instructor'), assignmentController.getInstructorStats);
router.get('/lesson/:lessonId', authMiddleware, assignmentController.getByLesson);
router.get('/submissions', authMiddleware, assignmentController.getSubmissions);

export default router;
