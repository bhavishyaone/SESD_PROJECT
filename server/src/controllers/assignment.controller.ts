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
}
