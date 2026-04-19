import { Document, Types } from 'mongoose';

export interface ILessonProgress {
  lessonId: Types.ObjectId;
  videoWatched: boolean;
  notesDownloaded: boolean;
  quizAttempted: boolean;
  isCompleted: boolean;
}

export interface IEnrollment extends Document {
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  progress: number;
  progressTracking: ILessonProgress[];
  status: 'active' | 'completed' | 'dropped';
  enrolledAt: Date;
  updatedAt: Date;
}
