import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ParkingActionService } from './parking-action.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { FetchParkingAction } from 'src/interfaces/parkingAction.interface';

@Controller('parking-action')
export class ParkingActionController {
  constructor(private parkingActionService: ParkingActionService) {}

  @UseGuards(AuthGuard)
  @Get('user-actions')
  async getUserParkingActions(@Request() req): Promise<FetchParkingAction[]> {
    const { username } = req.user;
    return this.parkingActionService.getUserParkingActions(username);
  }
}
