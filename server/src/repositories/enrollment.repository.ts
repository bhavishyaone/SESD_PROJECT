import { BaseRepository } from './base.repository';
import { Enrollment } from '../models/enrollment.model';
import { IEnrollment } from '../interfaces/enrollment.interface';

export class EnrollmentRepository extends BaseRepository<IEnrollment> {
  constructor() {
    super(Enrollment);
  }
}
