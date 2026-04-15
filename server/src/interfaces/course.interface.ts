import { Document, Types } from 'mongoose';

export interface ILesson extends Document {
  moduleId: Types.ObjectId;
  title: string;
  content: string;
}

export interface IModule extends Document {
  courseId: Types.ObjectId;
  title: string;
  orderIndex: number;
}

export interface ICourse extends Document {
  title: string;
  description: string;
  instructorId: Types.ObjectId;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}
