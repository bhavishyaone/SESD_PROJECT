import { Document, Types } from 'mongoose';

export interface IQuestion {
  questionText: string;
  options: string[]; // Length exactly 4
  correctOptionIndex: number; // 0, 1, 2, or 3
  marks: number;
}

export interface IAssignment extends Document {
  lessonId: Types.ObjectId;
  title: string;
  maxMarks: number;
  gradingType: 'percentage' | 'pass_fail';
  questions: IQuestion[];
}

export interface ISubmission extends Document {
  assignmentId: Types.ObjectId;
  studentId: Types.ObjectId;
  answers: number[]; // Array of selected option indices corresponding to questions
  marks?: number;
  status: 'submitted' | 'graded';
  submittedAt: Date;
}
