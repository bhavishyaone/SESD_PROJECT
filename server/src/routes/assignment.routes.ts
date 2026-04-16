import { Router } from 'express';
import { AssignmentController } from '../controllers/assignment.controller';

const router = Router();
const assignmentController = new AssignmentController();

router.post('/', assignmentController.create);
router.post('/submit', assignmentController.submit);

export default router;
