import { Request, Response, NextFunction } from 'express';
import { AssignmentService } from '../services/assignment.service';
import { AuthRequest } from '../middleware/auth.middleware';

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

  public submit = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const submission = await this.assignmentService.submitAssignment({
        ...req.body,
        studentId: req.user!.id
      });
      res.status(201).json({ status: 'success', data: submission });
    } catch (err) {
      next(err);
    }
  };

  public getSubmissions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter: Record<string, any> = {};
      if (req.query.studentId) filter.studentId = req.query.studentId;
      if (req.query.assignmentId) filter.assignmentId = req.query.assignmentId;
      const submissions = await this.assignmentService.getSubmissions(filter);
      res.status(200).json({ status: 'success', data: submissions });
    } catch (err) {
      next(err);
    }
  };

  public getInstructorStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.assignmentService.getInstructorStats(req.user!.id);
      res.status(200).json({ status: 'success', data: stats });
    } catch (err) {
      next(err);
    }
  };

  public getByLesson = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const assignments = await this.assignmentService.getAssignmentsByLesson(req.params.lessonId);
      res.status(200).json({ status: 'success', data: assignments[0] || null }); // return first assignment mapped
    } catch (err) {
      next(err);
    }
  };
}
