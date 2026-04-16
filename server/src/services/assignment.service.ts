import { AssignmentRepository, SubmissionRepository } from '../repositories/assignment.repository';
import { IAssignment, ISubmission } from '../interfaces/assignment.interface';
import ApiError from '../utils/ApiError';

export class AssignmentService {
  private assignmentRepository: AssignmentRepository;
  private submissionRepository: SubmissionRepository;

  constructor() {
    this.assignmentRepository = new AssignmentRepository();
    this.submissionRepository = new SubmissionRepository();
  }

  public async createAssignment(data: Partial<IAssignment>): Promise<IAssignment> {
    return this.assignmentRepository.save(data as any);
  }

  public async submitAssignment(data: Partial<ISubmission>): Promise<ISubmission> {
    return this.submissionRepository.save(data as any);
  }
}
