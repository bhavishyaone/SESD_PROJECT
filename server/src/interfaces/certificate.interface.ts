import { Document, Types } from 'mongoose';

export interface ICertificate extends Document {
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  issuedAt: Date;
}
