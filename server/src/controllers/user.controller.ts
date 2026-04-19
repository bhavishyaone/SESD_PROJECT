import { Request, Response } from 'express';
import { User } from '../models/user.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class UserController {
  public async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const studentId = (req as any).user.id;
      const { name, email, password } = req.body;

      const user = await User.findById(studentId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      if (name) user.name = name;
      if (email) user.email = email;
      if (password && password.trim() !== '') {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }

      await user.save();
      const token = jwt.sign(
        { id: user._id, role: user.role, name: user.name, email: user.email },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      );

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }
      });
    } catch (error: any) {
      console.error('Update Profile failed:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
