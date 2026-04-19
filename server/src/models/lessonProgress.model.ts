import { Schema, model } from 'mongoose';
import { ILessonProgress } from '../interfaces/lessonProgress.interface';

const lessonProgressSchema = new Schema<ILessonProgress>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  completedAt: { type: Date, default: Date.now }
});
lessonProgressSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });

export const LessonProgress = model<ILessonProgress>('LessonProgress', lessonProgressSchema);
