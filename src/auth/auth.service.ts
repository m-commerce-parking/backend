import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRegister } from 'src/interfaces/user.interface';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async registerUser(payload: UserRegister) {
    const { username, password, passwordConfirm } = payload;
    try {
      await this.usersService.create({ username, password, passwordConfirm });
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Username already exists');
      }
      throw error;
    }

    return { message: 'User registered successfully' };
  }

  async loginUser(token: string) {
    return this.jwtService.verify(token);
  }
}
