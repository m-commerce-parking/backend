import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ParkingActionController } from './parking-action.controller';
import { ParkingActionService } from './parking-action.service';
import {
  ParkingAction,
  ParkingActionSchema,
} from 'src/schemas/parkingAction.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Car, CarSchema } from 'src/schemas/car.schema';
import {
  ParkingSpace,
  ParkingSpaceSchema,
} from 'src/schemas/parkingSpace.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ParkingAction.name, schema: ParkingActionSchema },
      { name: User.name, schema: UserSchema },
      { name: Car.name, schema: CarSchema },
      { name: ParkingSpace.name, schema: ParkingSpaceSchema },
    ]),
  ],
  controllers: [ParkingActionController],
  providers: [ParkingActionService],
  exports: [ParkingActionService],
})
export class ParkingActionModule {}
