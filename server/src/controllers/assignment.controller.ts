import { Request, Response, NextFunction } from 'express';
import { AssignmentService } from '../services/assignment.service';

export class AssignmentController {
  private assignmentService: AssignmentService;

  constructor() {
    this.assignmentService = new AssignmentService();
  }

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const assignment = await this.assignmentService.createAssignment(req.body);
      res.status(201).json({ status: 'success', data: assignment });
    } catch (err) {
      next(err);
    }
  };

  public submit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const submission = await this.assignmentService.submitAssignment(req.body);
      res.status(201).json({ status: 'success', data: submission });
    } catch (err) {
      next(err);
    }
  };

  public getSubmissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const submissions = await this.assignmentService.getSubmissions();
      res.status(200).json({ status: 'success', data: submissions });
    } catch (err) {
      next(err);
    }
  };

  public grade = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { submissionId, marks } = req.body;
      const graded = await this.assignmentService.gradeSubmission(submissionId, marks);
      res.status(200).json({ status: 'success', data: graded });
    } catch (err) {
      next(err);
    }
  };
}
