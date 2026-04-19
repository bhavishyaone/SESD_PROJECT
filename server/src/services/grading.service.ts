import { SubmissionRepository } from '../repositories/assignment.repository';
import { AssignmentRepository } from '../repositories/assignment.repository';
import { GradingStrategy, PercentageStrategy, PassFailStrategy } from '../strategies/grading.strategy';
import { EnrollmentService } from './enrollment.service';
import { CertificateService } from './certificate.service';
import { ISubmission } from '../interfaces/assignment.interface';
import ApiError from '../utils/ApiError';

export class GradingService {
  private submissionRepository: SubmissionRepository;
  private assignmentRepository: AssignmentRepository;
  private enrollmentService: EnrollmentService;
  private certificateService: CertificateService;

  constructor() {
    this.submissionRepository = new SubmissionRepository();
    this.assignmentRepository = new AssignmentRepository();
    this.enrollmentService = new EnrollmentService();
    this.certificateService = new CertificateService();
  }

  public async evaluateSubmission(
    submissionId: string,
    marks: number,
    courseId: string
  ): Promise<{ submission: ISubmission; progress: number; certificateIssued: boolean }> {
    const submission = await this.submissionRepository.findById(submissionId);
    if (!submission) throw new ApiError(404, 'Submission not found');

    const assignment = await this.assignmentRepository.findById(submission.assignmentId.toString());
    if (!assignment) throw new ApiError(404, 'Assignment not found');

    let strategy: GradingStrategy;
    if (assignment.gradingType === 'pass_fail') {
      strategy = new PassFailStrategy();
    } else {
      strategy = new PercentageStrategy();
    }

    const calculatedScore = strategy.calculate({ marks }, assignment.maxMarks);

    const updated = await this.submissionRepository.update(submissionId, {
      marks: calculatedScore,
      status: 'graded'
    } as any);

    if (!updated) throw new ApiError(500, 'Failed to update submission');

    const studentId = submission.studentId.toString();

    const allSubmissions = await this.submissionRepository.findAll({ studentId } as any);
    const gradedCount = allSubmissions.filter((s: any) => s.status === 'graded').length;
    const totalCount = allSubmissions.length;
    const progress = totalCount > 0 ? Math.round((gradedCount / totalCount) * 100) : 0;

    await this.enrollmentService.updateProgress(studentId, courseId, progress);

    let certificateIssued = false;
    if (progress >= 100) {
      await this.certificateService.checkAndGenerate(studentId, courseId);
      certificateIssued = true;
    }

    return { submission: updated, progress, certificateIssued };
  }
}
