import { Request, Response, NextFunction } from 'express';
import { GradingService } from '../services/grading.service';

export class GradingController {
  private gradingService: GradingService;

  constructor() {
    this.gradingService = new GradingService();
  }

  public evaluate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { submissionId, marks, courseId } = req.body;
      const result = await this.gradingService.evaluateSubmission(submissionId, marks, courseId);
      res.status(200).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  };
}
