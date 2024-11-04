import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  parkingActionStatusEnum,
  parkingSpaceStatusEnum,
} from 'src/constants/enums';
import { PayParkingResponse } from 'src/interfaces/parkingAction.interface';
import { Car } from 'src/schemas/car.schema';
import { ParkingAction } from 'src/schemas/parkingAction.schema';
import { ParkingSpace } from 'src/schemas/parkingSpace.schema';
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
    @InjectModel(ParkingSpace.name)
    private parkingSpaceModel: Model<ParkingSpace>,
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

  async payParking(
    username: string,
    amount: number,
    carLicense: string,
  ): Promise<PayParkingResponse> {
    try {
      const user = await this.userModel.findOne({ username });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (user.credits < amount) {
        throw new BadRequestException('Not enough credits');
      }

      const car = await this.carModel.findOne({
        registrationPlate: carLicense,
        ownerId: user._id,
      });
      if (!car) {
        throw new BadRequestException('Car not found');
      }

      const parkingAction = await this.parkingActionModel.findOne({
        carId: car._id,
        status: parkingActionStatusEnum.pending,
      });
      if (!parkingAction) {
        throw new BadRequestException('Parking action not found');
      }

      await this.userModel.updateOne(
        { username },
        { $inc: { credits: -amount } },
      );

      await this.parkingActionModel.updateOne(
        { _id: parkingAction._id },
        {
          status: parkingActionStatusEnum.paid,
          leaveTime: new Date(),
        },
      );

      await this.parkingSpaceModel.updateOne(
        { _id: parkingAction.parkingSpaceId },
        { status: parkingSpaceStatusEnum.free },
      );

      const newUserCredits = user.credits - amount;
      return {
        parkingActionId: parkingAction._id.toString(),
        newUserCredits,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
