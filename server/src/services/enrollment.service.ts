import { EnrollmentRepository } from '../repositories/enrollment.repository';
import { IEnrollment } from '../interfaces/enrollment.interface';
import ApiError from '../utils/ApiError';

export class EnrollmentService {
  private enrollmentRepository: EnrollmentRepository;

  constructor() {
    this.enrollmentRepository = new EnrollmentRepository();
  }

  public async enrollStudent(data: Partial<IEnrollment>): Promise<IEnrollment> {
    return this.enrollmentRepository.save(data as any);
  }

  public async getEnrollment(id: string): Promise<IEnrollment> {
    const enrollment = await this.enrollmentRepository.findById(id);
    if (!enrollment) {
      throw new ApiError(404, 'Enrollment not found');
    }
    return enrollment;
  }
}
