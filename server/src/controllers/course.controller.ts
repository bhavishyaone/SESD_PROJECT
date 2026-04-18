import { Request, Response, NextFunction } from 'express';
import { CourseService } from '../services/course.service';

export class CourseController {
  private courseService: CourseService;

  constructor() {
    this.courseService = new CourseService();
  }

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const course = await this.courseService.createCourse(req.body);
      res.status(201).json({
        status: 'success',
        data: course
      });
    } catch (err) {
      next(err);
    }
  };

  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const courses = await this.courseService.getAllCourses();
      res.status(200).json({
        status: 'success',
        data: courses
      });
    } catch (err) {
      next(err);
    }
  };

  public createModule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const moduleItem = await this.courseService.createModule({
            ...req.body,
            courseId: req.params.id
        });
        res.status(201).json({ status: 'success', data: moduleItem });
      } catch (err) {
        next(err);
      }
  };

  public getModules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const modules = await this.courseService.getCourseModules(req.params.id);
        res.status(200).json({ status: 'success', data: modules });
      } catch (err) {
        next(err);
      }
  };

  public createLesson = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const lessonItem = await this.courseService.createLesson({
            ...req.body,
            moduleId: req.params.moduleId
        });
        res.status(201).json({ status: 'success', data: lessonItem });
      } catch (err) {
        next(err);
      }
  };

  public getLessons = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const lessons = await this.courseService.getModuleLessons(req.params.moduleId);
        res.status(200).json({ status: 'success', data: lessons });
      } catch (err) {
        next(err);
      }
  };

  public get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const course = await this.courseService.getCourseById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: course
      });
    } catch (err) {
      next(err);
    }
  };

  public publish = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const course = await this.courseService.publishCourse(req.params.id);
      res.status(200).json({
        status: 'success',
        data: course
      });
    } catch (err) {
      next(err);
    }
  };
}
