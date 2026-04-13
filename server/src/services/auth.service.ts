import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { IUser, UserRole } from '../interfaces/user.interface';
import ApiError from '../utils/ApiError';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  public async registerUser(userData: Record<string, any>): Promise<{ user: Omit<IUser, 'password'>; token: string }> {
    const existingUser = await this.userRepository.findByEmail(userData.email as string);
    if (existingUser) {
      throw new ApiError(409, 'Email already in use.');
    }

    if (!userData.role) {
      userData.role = UserRole.STUDENT;
    }

    // Save triggers the pre-save password hash
    const newUser = await this.userRepository.save(userData);
    
    // Remove password before returning
    const userObj = newUser.toObject();
    delete userObj.password;

    const token = this.generateToken(userObj._id.toString(), userObj.role);

    return { user: userObj, token };
  }

  public async loginUser(email: string, passwordString: string): Promise<{ user: Omit<IUser, 'password'>; token: string }> {
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isPasswordMatch = await user.comparePassword(passwordString);
    if (!isPasswordMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const userObj = user.toObject();
    delete userObj.password;

    const token = this.generateToken(userObj._id.toString(), userObj.role);

    return { user: userObj, token };
  }

  private generateToken(userId: string, role: string): string {
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    return jwt.sign({ id: userId, role }, secret, {
      expiresIn: '7d',
    });
  }

  public verifyToken(token: string): any {
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    try {
      return jwt.verify(token, secret);
    } catch (err) {
      throw new ApiError(401, 'Invalid or expired token');
    }
  }
}
