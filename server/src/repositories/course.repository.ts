import { BaseRepository } from './base.repository';
import { Course } from '../models/course.model';
import { ICourse } from '../interfaces/course.interface';

export class CourseRepository extends BaseRepository<ICourse> {
  constructor() {
    super(Course);
  }
}
