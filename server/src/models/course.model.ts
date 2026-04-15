import { Schema, model } from 'mongoose';
import { ICourse, IModule, ILesson } from '../interfaces/course.interface';

const lessonSchema = new Schema<ILesson>({
  moduleId: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true }
});

const moduleSchema = new Schema<IModule>({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  orderIndex: { type: Number, required: true }
});

const courseSchema = new Schema<ICourse>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' }
}, { timestamps: true });

export const Lesson = model<ILesson>('Lesson', lessonSchema);
export const Module = model<IModule>('Module', moduleSchema);
export const Course = model<ICourse>('Course', courseSchema);
