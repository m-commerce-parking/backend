import { Body, Controller, Logger, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRegister } from 'src/interfaces/user.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private log: Logger,
  ) {}

  @Post('register')
  async registerUser(@Body() user: UserRegister) {
    return this.authService.registerUser(user);
  }
}
