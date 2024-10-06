import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AuthGuard)
  @Post('add-funds')
  async addFunds(@Request() req, @Body() payload: { amount: number }) {
    const username = req.user.username;
    return this.userService.addFunds(username, payload.amount);
  }
}
