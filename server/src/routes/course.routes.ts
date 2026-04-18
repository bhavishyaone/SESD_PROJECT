import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';

const router = Router();
const courseController = new CourseController();

router.get('/', courseController.getAll);
router.post('/', courseController.create);
router.get('/:id', courseController.get);
router.patch('/:id/publish', courseController.publish);

router.post('/:id/modules', courseController.createModule);
router.get('/:id/modules', courseController.getModules);

router.post('/modules/:moduleId/lessons', courseController.createLesson);
router.get('/modules/:moduleId/lessons', courseController.getLessons);

export default router;
