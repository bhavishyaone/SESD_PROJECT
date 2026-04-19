import { Request, Response, NextFunction } from 'express';
import { EnrollmentService } from '../services/enrollment.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class EnrollmentController {
  private enrollmentService: EnrollmentService;

  constructor() {
    this.enrollmentService = new EnrollmentService();
  }

  public enroll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = req.user!.id;
      const { courseId } = req.body;
      const enrollment = await this.enrollmentService.enrollStudent(studentId, courseId);
      res.status(201).json({ status: 'success', data: enrollment });
    } catch (err) {
      next(err);
    }
  };

  public list = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = (req.query.studentId as string) || req.user!.id;
      const enrollments = await this.enrollmentService.getEnrollmentsByStudent(studentId);
      res.status(200).json({ status: 'success', data: enrollments });
    } catch (err) {
      next(err);
    }
  };

  public listByCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const enrollments = await this.enrollmentService.getEnrollmentsByCourse(req.params.courseId);
      res.status(200).json({ status: 'success', data: enrollments });
    } catch (err) {
      next(err);
    }
  };

  public get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const enrollment = await this.enrollmentService.getEnrollment(req.params.id);
      res.status(200).json({ status: 'success', data: enrollment });
    } catch (err) {
      next(err);
    }
  };

  public updateProgress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId, courseId, progress } = req.body;
      const enrollment = await this.enrollmentService.updateProgress(studentId, courseId, progress);
      res.status(200).json({ status: 'success', data: enrollment });
    } catch (err) {
      next(err);
    }
  };

  public completeLesson = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = req.user!.id;
      const { lessonId } = req.params;
      const { courseId } = req.body;
      
      const progressRecord = await this.enrollmentService.completeLesson(studentId, lessonId, courseId);
      res.status(200).json({ status: 'success', data: progressRecord });
    } catch (err) {
      next(err);
    }
  };

  public postLessonProgress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = req.user!.id;
      const { courseId } = req.params;
      const { lessonId, actionType } = req.body;
      
      const updatedEnrollment = await this.enrollmentService.updateLessonProgress(studentId, courseId, lessonId, actionType);
      res.status(200).json({ status: 'success', data: updatedEnrollment });
    } catch (err) {
      next(err);
    }
  };

  public getLessonProgress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = (req.query.studentId as string) || req.user!.id;
      const courseId = req.query.courseId as string;
      
      const progressRecords = await this.enrollmentService.getLessonProgressForStudent(studentId, courseId);
      res.status(200).json({ status: 'success', data: progressRecords });
    } catch (err) {
      next(err);
    }
  };
}
