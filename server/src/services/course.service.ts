import { CourseRepository } from '../repositories/course.repository';
import { ICourse } from '../interfaces/course.interface';
import ApiError from '../utils/ApiError';

export class CourseService {
  private courseRepository: CourseRepository;

  constructor() {
    this.courseRepository = new CourseRepository();
  }

  public async createCourse(courseData: Partial<ICourse>): Promise<ICourse> {
    return this.courseRepository.save(courseData as any);
  }

  public async getCourseById(id: string): Promise<ICourse> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }
    return course;
  }

  public async publishCourse(id: string): Promise<ICourse> {
    const course = await this.courseRepository.update(id, { status: 'published' } as any);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }
    return course;
  }
}
