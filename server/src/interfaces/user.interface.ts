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
}

export interface IInstructor extends IUser {
}

export interface IAdmin extends IUser {
}
