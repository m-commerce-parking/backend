import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Car } from 'src/schemas/car.schema';
import { ParkingAction } from 'src/schemas/parkingAction.schema';
import { User } from 'src/schemas/user.schema';

interface FetchParkingAction {
  id: string;
  parkingSpaceId: string;
  parkingSpaceNumber: number;
  carId: string;
  carRegistrationPlate: string;
  status: string;
  parkTime: Date;
  leaveTime: Date | null;
}

@Injectable()
export class ParkingActionService {
  constructor(
    @InjectModel(ParkingAction.name)
    private parkingActionModel: Model<ParkingAction>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Car.name) private carModel: Model<Car>,
  ) {}

  async getUserParkingActions(username: string): Promise<FetchParkingAction[]> {
    try {
      const userInfo = await this.userModel.findOne({ username });
      if (!userInfo) {
        throw new BadRequestException('User not found');
      }

      const userCars = await this.carModel.find({
        ownerId: userInfo._id,
      });
      const userCarsIds = userCars.map((car) => car._id);

      const parkingActions = await this.parkingActionModel
        .find({
          carId: { $in: userCarsIds },
        })
        .populate('parkingSpaceId')
        .populate('carId')
        .exec();

      return parkingActions.map((action) => ({
        id: action._id.toString(),
        parkingSpaceId: action.parkingSpaceId._id.toString(),
        parkingSpaceNumber: action.parkingSpaceNumber,
        carId: action.carId._id.toString(),
        carRegistrationPlate: (action.carId as any).registrationPlate,
        status: action.status,
        parkTime: action.parkTime,
        leaveTime: action.leaveTime,
      }));
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
