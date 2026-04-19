import { CertificateRepository } from '../repositories/certificate.repository';
import { ICertificate } from '../interfaces/certificate.interface';
import ApiError from '../utils/ApiError';

export class CertificateService {
  private certificateRepository: CertificateRepository;

  constructor() {
    this.certificateRepository = new CertificateRepository();
  }

  public async generateCertificate(studentId: string, courseId: string): Promise<ICertificate> {
    const existing = await this.certificateRepository.findByStudentAndCourse(studentId, courseId);
    if (existing) throw new ApiError(409, 'Certificate already issued for this course');
    return this.certificateRepository.save({ studentId, courseId } as any);
  }

  public async checkAndGenerate(studentId: string, courseId: string): Promise<ICertificate | null> {
    const existing = await this.certificateRepository.findByStudentAndCourse(studentId, courseId);
    if (existing) return existing;
    return this.certificateRepository.save({ studentId, courseId } as any);
  }

  public async getCertificatesByStudent(studentId: string): Promise<ICertificate[]> {
    return this.certificateRepository.findByStudent(studentId);
  }

  public async getCertificate(id: string): Promise<ICertificate> {
    const cert = await this.certificateRepository.findById(id);
    if (!cert) throw new ApiError(404, 'Certificate not found');
    return cert;
  }
}
