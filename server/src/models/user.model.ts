import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, IStudent, IInstructor, IAdmin, UserRole } from '../interfaces/user.interface';

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(UserRole), required: true, default: UserRole.STUDENT },
  },
  {
    timestamps: true,
    discriminatorKey: 'role'
  }
);

// Pre-save hook for password hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password as string);
};

export const User = model<IUser>('User', userSchema);

export const Student = User.discriminator<IStudent>('Student', new Schema({}));
export const Instructor = User.discriminator<IInstructor>('Instructor', new Schema({}));
export const Admin = User.discriminator<IAdmin>('Admin', new Schema({}));
