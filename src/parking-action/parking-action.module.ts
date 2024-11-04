import { Module } from '@nestjs/common';
import { ParkingActionController } from './parking-action.controller';
import { ParkingActionService } from './parking-action.service';

@Module({
  controllers: [ParkingActionController],
  providers: [ParkingActionService]
})
export class ParkingActionModule {}
