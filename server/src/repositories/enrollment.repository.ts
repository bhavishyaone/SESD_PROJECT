import { BaseRepository } from './base.repository';
import { Enrollment } from '../models/enrollment.model';
import { IEnrollment } from '../interfaces/enrollment.interface';

export class EnrollmentRepository extends BaseRepository<IEnrollment> {
  constructor() {
    super(Enrollment);
  }

  public async findByStudent(studentId: string): Promise<IEnrollment[]> {
    return this.model.find({ studentId }).populate('courseId', 'title description status').exec();
  }

  public async findByCourse(courseId: string): Promise<IEnrollment[]> {
    return this.model.find({ courseId }).populate('studentId', 'name email').exec();
  }

  public async findByStudentAndCourse(studentId: string, courseId: string): Promise<IEnrollment | null> {
    return this.model.findOne({ studentId, courseId }).exec();
  }
}
