import { Request, Response, NextFunction } from 'express';
import { EnrollmentService } from '../services/enrollment.service';

export class EnrollmentController {
  private enrollmentService: EnrollmentService;

  constructor() {
    this.enrollmentService = new EnrollmentService();
  }

  public enroll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const enrollment = await this.enrollmentService.enrollStudent(req.body);
      res.status(201).json({ status: 'success', data: enrollment });
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
}
