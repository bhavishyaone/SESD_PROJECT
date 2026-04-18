import { CourseRepository } from '../repositories/course.repository';
import { ICourse } from '../interfaces/course.interface';
import ApiError from '../utils/ApiError';

import { ModuleRepository } from '../repositories/module.repository';
import { LessonRepository } from '../repositories/lesson.repository';

export class CourseService {
  private courseRepository: CourseRepository;
  private moduleRepository: ModuleRepository;
  private lessonRepository: LessonRepository;

  constructor() {
    this.courseRepository = new CourseRepository();
    this.moduleRepository = new ModuleRepository();
    this.lessonRepository = new LessonRepository();
  }

  public async createCourse(courseData: Partial<ICourse>): Promise<ICourse> {
    return this.courseRepository.save(courseData as any);
  }

  public async getAllCourses(): Promise<ICourse[]> {
    return this.courseRepository.findAll();
  }

  public async createModule(moduleData: Partial<IModule>): Promise<IModule> {
    return this.moduleRepository.save(moduleData as any);
  }

  public async getCourseModules(courseId: string): Promise<IModule[]> {
     return this.moduleRepository.findAll({ courseId } as any);
  }

  public async createLesson(lessonData: Partial<ILesson>): Promise<ILesson> {
    return this.lessonRepository.save(lessonData as any);
  }

  public async getModuleLessons(moduleId: string): Promise<ILesson[]> {
    return this.lessonRepository.findAll({ moduleId } as any);
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
