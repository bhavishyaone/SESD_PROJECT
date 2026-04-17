import { BaseRepository } from './base.repository';
import { Certificate } from '../models/certificate.model';
import { ICertificate } from '../interfaces/certificate.interface';

export class CertificateRepository extends BaseRepository<ICertificate> {
  constructor() {
    super(Certificate);
  }

  public async findByStudentAndCourse(studentId: any, courseId: any): Promise<ICertificate | null> {
    return this.model.findOne({ studentId, courseId });
  }
}
