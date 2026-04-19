import { Schema, model } from 'mongoose';
import { IAssignment, ISubmission } from '../interfaces/assignment.interface';

const questionSchema = new Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true },
  marks: { type: Number, required: true }
});

const assignmentSchema = new Schema<IAssignment>({
  lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
  title: { type: String, required: true },
  maxMarks: { type: Number, required: true },
  gradingType: { type: String, enum: ['percentage', 'pass_fail'], default: 'percentage' },
  questions: [questionSchema]
}, { timestamps: true });

const submissionSchema = new Schema<ISubmission>({
  assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [{ type: Number, required: true }],
  marks: { type: Number },
  status: { type: String, enum: ['submitted', 'graded'], default: 'submitted' },
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const Assignment = model<IAssignment>('Assignment', assignmentSchema);
export const Submission = model<ISubmission>('Submission', submissionSchema);
