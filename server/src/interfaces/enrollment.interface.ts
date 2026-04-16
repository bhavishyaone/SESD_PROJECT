import { Document, Types } from 'mongoose';

export interface IEnrollment extends Document {
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  progress: number;
  status: 'active' | 'completed' | 'dropped';
  enrolledAt: Date;
  updatedAt: Date;
}
