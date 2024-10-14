import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Car } from '../schemas/car.schema';
import { User } from '../schemas/user.schema';
import {
  parkingActionStatusEnum,
  parkingSpaceStatusEnum,
} from '../constants/enums';
import { ParkingSpace } from 'src/schemas/parkingSpace.schema';
import { ParkingAction } from 'src/schemas/parkingAction.schema';
import {
  ParkingSpaceInfoDto,
  ParkingSpaceResponseDto,
} from './dto/order-parking-space.dto';

@Injectable()
export class ParkingSpacesService {
  constructor(
    @InjectModel(Car.name) private carModel: Model<Car>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(ParkingSpace.name)
    private parkingSpaceModel: Model<ParkingSpace>,
    @InjectModel(ParkingAction.name)
    private parkingActionModel: Model<ParkingAction>,
  ) {}

  async orderParkingSpace(
    selectedCar: string,
    username: string,
  ): Promise<ParkingAction> {
    const foundCar = await this.carModel.findById(selectedCar);
    if (!foundCar) {
      throw new NotFoundException('Car not found');
    }

    const pendingParkingAction = await this.parkingActionModel.findOne({
      carId: foundCar._id,
      status: parkingActionStatusEnum.pending,
    });
    if (pendingParkingAction) {
      throw new ConflictException('Car already has a pending parking action');
    }

    const foundUser = await this.userModel.findOne({ username });
    if (!foundUser) {
      throw new NotFoundException('User not found');
    }

    if (foundCar.ownerId.toString() !== foundUser._id.toString()) {
      throw new ConflictException('Car does not belong to you');
    }

    const freeParkingSpaces = await this.parkingSpaceModel.find({
      status: parkingSpaceStatusEnum.free,
    });
    if (freeParkingSpaces.length === 0) {
      throw new ConflictException('No free parking spaces available');
    }

    const randomFreeParkingSpace =
      freeParkingSpaces[Math.floor(Math.random() * freeParkingSpaces.length)];

    const parkingSpaceAction = await this.parkingActionModel.create({
      parkingSpaceNumber: randomFreeParkingSpace.spaceNumber,
      parkingSpaceId: randomFreeParkingSpace._id,
      carId: foundCar._id,
      status: parkingActionStatusEnum.pending,
      parkTime: new Date(),
      leaveTime: null,
    });

    await this.parkingSpaceModel.updateOne(
      { _id: randomFreeParkingSpace._id },
      { status: parkingSpaceStatusEnum.occupied },
    );

    return parkingSpaceAction;
  }

  async getParkingSpaces(): Promise<ParkingSpaceResponseDto[]> {
    const parkingSpaces = await this.parkingSpaceModel.find().exec();
    if (!parkingSpaces || parkingSpaces.length === 0) {
      throw new NotFoundException('No parking spaces found');
    }
    return parkingSpaces.map((space) => ({
      _id: space._id.toString(),
      spaceNumber: space.spaceNumber,
      status: space.status,
    }));
  }

  async getParkingSpaceInfo(
    parkingSpaceNumber: number,
  ): Promise<ParkingSpaceInfoDto> {
    const parkingSpace = await this.parkingSpaceModel
      .findOne({ spaceNumber: parkingSpaceNumber })
      .exec();
    if (!parkingSpace) {
      throw new NotFoundException('Parking space not found');
    }

    if (parkingSpace.status === parkingSpaceStatusEnum.free) {
      return {
        carRegistrationPlate: null,
        parkTime: null,
      };
    }

    const parkingAction = await this.parkingActionModel
      .findOne({
        parkingSpaceId: parkingSpace._id,
        status: parkingActionStatusEnum.pending,
      })
      .exec();

    if (!parkingAction) {
      throw new NotFoundException('Parking action not found');
    }

    const car = await this.carModel.findById(parkingAction.carId).exec();
    if (!car) {
      throw new NotFoundException('Car not found');
    }

    return {
      carRegistrationPlate: car.registrationPlate,
      parkTime: parkingAction.parkTime,
    };
  }
}
