import { Document, Types } from 'mongoose';

export interface ILessonProgress extends Document {
  studentId: Types.ObjectId | string;
  lessonId: Types.ObjectId | string;
  courseId: Types.ObjectId | string;
  completedAt: Date;
}
