import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';

const router = Router();
const courseController = new CourseController();

router.post('/', courseController.create);
router.get('/:id', courseController.get);
router.patch('/:id/publish', courseController.publish);

export default router;
