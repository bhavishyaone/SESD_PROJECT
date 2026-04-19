import { Request, Response, NextFunction } from 'express';
import { CourseService } from '../services/course.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class CourseController {
  private courseService: CourseService;

  constructor() {
    this.courseService = new CourseService();
  }

  public create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const course = await this.courseService.createCourse({
        ...req.body,
        instructorId: req.user!.id
      });
      res.status(201).json({ status: 'success', data: course });
    } catch (err) {
      next(err);
    }
  };

  public getAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter: Record<string, any> = {};
      if (req.query.status) filter.status = req.query.status;
      if (req.query.instructorId) filter.instructorId = req.query.instructorId;
      if (req.user?.role?.toLowerCase() === 'student') {
        filter.status = 'published';
      }
      const courses = await this.courseService.getAllCourses(filter);
      res.status(200).json({ status: 'success', data: courses });
    } catch (err) {
      next(err);
    }
  };

  public get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const course = await this.courseService.getCourseById(req.params.id);
      res.status(200).json({ status: 'success', data: course });
    } catch (err) {
      next(err);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const course = await this.courseService.updateCourse(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: course });
    } catch (err) {
      next(err);
    }
  };

  public publish = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const course = await this.courseService.publishCourse(req.params.id);
      res.status(200).json({ status: 'success', data: course });
    } catch (err) {
      next(err);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.courseService.deleteCourse(req.params.id);
      res.status(200).json({ status: 'success', message: 'Course deleted' });
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

  public deleteModule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.courseService.deleteModule(req.params.moduleId);
      res.status(200).json({ status: 'success', message: 'Module deleted' });
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

  public deleteLesson = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.courseService.deleteLesson(req.params.lessonId);
      res.status(200).json({ status: 'success', message: 'Lesson deleted' });
    } catch (err) {
      next(err);
    }
  };

  public getCourseAssignments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const assignments = await this.courseService.getCourseAssignments(req.params.id);
      res.status(200).json({ status: 'success', data: assignments });
    } catch (err) {
      next(err);
    }
  };

  public getInstructorDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.courseService.getInstructorDashboardStats(req.user!.id);
      res.status(200).json({ status: 'success', data: stats });
    } catch (err) {
      next(err);
    }
  };

  public getCourseEnrollments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { Enrollment } = await import('../models/enrollment.model');
      const enrollments = await Enrollment.find({ courseId: req.params.id }).populate('studentId', 'name email').lean();
      res.status(200).json({ status: 'success', data: enrollments, total: enrollments.length });
    } catch (err) {
      next(err);
    }
  };
}
