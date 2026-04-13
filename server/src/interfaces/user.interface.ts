import { Document } from 'mongoose';

export enum UserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin'
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IStudent extends IUser {
  // specific student fields
}

export interface IInstructor extends IUser {
  // specific instructor fields
}

export interface IAdmin extends IUser {
  // specific admin fields
}
