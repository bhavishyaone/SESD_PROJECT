import { Schema, model } from 'mongoose';
import { IEnrollment } from '../interfaces/enrollment.interface';

const enrollmentSchema = new Schema<IEnrollment>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  progress: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed', 'dropped'], default: 'active' },
  enrolledAt: { type: Date, default: Date.now }
}, { timestamps: true });

enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const Enrollment = model<IEnrollment>('Enrollment', enrollmentSchema);
