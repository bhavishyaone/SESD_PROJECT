import { BaseRepository } from './base.repository';
import { LessonProgress } from '../models/lessonProgress.model';
import { ILessonProgress } from '../interfaces/lessonProgress.interface';

export class LessonProgressRepository extends BaseRepository<ILessonProgress> {
  constructor() {
    super(LessonProgress);
  }

  public async findByStudentAndCourse(studentId: string, courseId: string): Promise<ILessonProgress[]> {
    return this.model.find({ studentId, courseId }).exec();
  }

  public async findByStudentAndLesson(studentId: string, lessonId: string): Promise<ILessonProgress | null> {
    return this.model.findOne({ studentId, lessonId }).exec();
  }
}
