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
