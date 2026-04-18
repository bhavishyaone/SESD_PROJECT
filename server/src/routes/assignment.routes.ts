import { Router } from 'express';
import { AssignmentController } from '../controllers/assignment.controller';

const router = Router();
const assignmentController = new AssignmentController();

router.post('/', assignmentController.create);
router.post('/submit', assignmentController.submit);
router.get('/submissions', assignmentController.getSubmissions);
router.post('/grade', assignmentController.grade);

export default router;
