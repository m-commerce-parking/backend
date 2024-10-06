import {
  Body,
  Controller,
  Logger,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRegister } from 'src/interfaces/user.interface';
import { AuthGuard } from './auth.guard';

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

  @Post('login')
  async loginUser(@Body() user: UserRegister) {
    return this.authService.loginUser(user);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logOutUser(@Request() req) {
    const { username } = req.user;
    return this.authService.logOutUser(username);
  }
}
