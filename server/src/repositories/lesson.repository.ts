import { BaseRepository } from './base.repository';
import { Lesson } from '../models/course.model';
import { ILesson } from '../interfaces/course.interface';

export class LessonRepository extends BaseRepository<ILesson> {
  constructor() {
    super(Lesson);
  }
}
