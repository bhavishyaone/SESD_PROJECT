import { Schema, model } from 'mongoose';
import { ICertificate } from '../interfaces/certificate.interface';

const certificateSchema = new Schema<ICertificate>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  issuedAt: { type: Date, default: Date.now }
}, { timestamps: true });

certificateSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const Certificate = model<ICertificate>('Certificate', certificateSchema);
