import { SubmissionRepository } from '../repositories/assignment.repository';
import { GradingStrategy, PercentageStrategy, PassFailStrategy } from '../strategies/grading.strategy';
import { ISubmission } from '../interfaces/assignment.interface';
import ApiError from '../utils/ApiError';

export class GradingService {
  private submissionRepository: SubmissionRepository;

  constructor() {
    this.submissionRepository = new SubmissionRepository();
  }

  public async evaluateSubmission(submissionId: string, marks: number, type: 'percentage' | 'pass_fail', maxMarks: number): Promise<ISubmission> {
    const submission = await this.submissionRepository.findById(submissionId);
    if (!submission) {
      throw new ApiError(404, 'Submission not found');
    }
    
    let strategy: GradingStrategy;
    if (type === 'pass_fail') {
      strategy = new PassFailStrategy();
    } else {
      strategy = new PercentageStrategy();
    }

    const calculatedScore = strategy.calculate({ marks }, maxMarks);
    const updated = await this.submissionRepository.update(submissionId, { marks: calculatedScore, status: 'graded' } as any);
    if (!updated) {
      throw new ApiError(500, 'Failed to update submission');
    }
    return updated;
  }
}
