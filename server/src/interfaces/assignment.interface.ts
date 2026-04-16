import { Document, Types } from 'mongoose';

export interface IAssignment extends Document {
  lessonId: Types.ObjectId;
  title: string;
  maxMarks: number;
  gradingType: 'percentage' | 'pass_fail';
}

export interface ISubmission extends Document {
  assignmentId: Types.ObjectId;
  studentId: Types.ObjectId;
  content: string;
  marks?: number;
  status: 'submitted' | 'graded';
  submittedAt: Date;
}
