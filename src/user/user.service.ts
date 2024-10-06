import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRegister } from 'src/interfaces/user.interface';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findOne(username: string): Promise<User | undefined> {
    return this.userModel.findOne({ username }).exec();
  }

  async create(user: UserRegister): Promise<User> {
    if (!user.username || !user.password) {
      throw new BadRequestException('Username and password are required');
    }
    if (!user.passwordConfirm) {
      throw new BadRequestException('Password confirmation is required');
    }
    if (user.password !== user.passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }

    return this.userModel.create(user);
  }

  async addFunds(username: string, amount: number): Promise<User> {
    const user = await this.findOne(username);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return this.userModel
      .findOneAndUpdate(
        { username },
        { $inc: { credits: amount } },
        { new: true },
      )
      .select('credits')
      .exec();
  }
}
