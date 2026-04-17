import { CertificateRepository } from '../repositories/certificate.repository';
import { ICertificate } from '../interfaces/certificate.interface';
import ApiError from '../utils/ApiError';

export class CertificateService {
  private certificateRepository: CertificateRepository;

  constructor() {
    this.certificateRepository = new CertificateRepository();
  }

  public async generateCertificate(data: Partial<ICertificate>): Promise<ICertificate> {
    const existing = await this.certificateRepository.findByStudentAndCourse(data.studentId, data.courseId);
    if (existing) {
      throw new ApiError(409, 'Certificate already issued for this course');
    }
    
    return this.certificateRepository.save(data as any);
  }

  public async getCertificate(id: string): Promise<ICertificate> {
    const cert = await this.certificateRepository.findById(id);
    if (!cert) {
      throw new ApiError(404, 'Certificate not found');
    }
    return cert;
  }
}
