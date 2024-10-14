import { Module } from '@nestjs/common';
import { ParkingSpacesService } from './parking-spaces.service';
import { ParkingSpacesController } from './parking-spaces.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Car, CarSchema } from 'src/schemas/car.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import {
  ParkingSpace,
  ParkingSpaceSchema,
} from 'src/schemas/parkingSpace.schema';
import {
  ParkingAction,
  ParkingActionSchema,
} from 'src/schemas/parkingAction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Car.name, schema: CarSchema },
      { name: User.name, schema: UserSchema },
      { name: ParkingSpace.name, schema: ParkingSpaceSchema },
      { name: ParkingAction.name, schema: ParkingActionSchema },
    ]),
  ],
  controllers: [ParkingSpacesController],
  providers: [ParkingSpacesService],
})
export class ParkingSpacesModule {}
