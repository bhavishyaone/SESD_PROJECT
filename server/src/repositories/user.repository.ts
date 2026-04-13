import { BaseRepository } from './base.repository';
import { User } from '../models/user.model';
import { IUser } from '../interfaces/user.interface';

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  public async findByEmail(email: string): Promise<IUser | null> {
    return this.model.findOne({ email }).select('+password').exec();
  }
}
