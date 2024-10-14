import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCar } from 'src/interfaces/car.interface';
import { Car } from 'src/schemas/car.schema';
import { UserService } from 'src/user/user.service';
import { CarResponseDto } from './dto/cars.dto';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class CarsService {
  constructor(
    @InjectModel(Car.name) private carModel: Model<Car>,
    @InjectModel(User.name) private userModel: Model<User>,
    private usersService: UserService,
    private log: Logger,
  ) {}

  async createCar(carData: CreateCar) {
    const { registrationPlate, username } = carData;
    try {
      const user = await this.usersService.findOne(username);
      if (!user) {
        throw new ConflictException('User not found');
      }
      const data = await this.carModel.create({
        registrationPlate,
        ownerId: user._id,
      });
      return { message: 'Car registered successfully', data: data };
    } catch (error) {
      this.log.debug(error);
      if (error.code === 11000) {
        throw new ConflictException(
          'Car already exists or registration plate is invalid or already in use',
        );
      }
      throw error;
    }
  }

  async removeCar(carId: string, username: string) {
    try {
      const newCarId = new Types.ObjectId(carId);
      const user = await this.usersService.findOne(username);

      const car = await this.carModel.findOne({ _id: newCarId });
      console.log('Found car:', car);

      if (!car) {
        throw new NotFoundException('Car not found');
      }

      const result = await this.carModel
        .deleteOne({ _id: newCarId, ownerId: user._id })
        .exec();

      if (result.deletedCount === 0) {
        throw new ConflictException(
          'Car not found or user does not have permission to delete it',
        );
      }

      return result;
    } catch (error) {
      if (error) {
        throw new BadRequestException('Invalid car ID format');
      }
      throw error;
    }
  }

  async getCars(username: string): Promise<CarResponseDto[]> {
    const user = await this.userModel.findOne({ username }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const cars = await this.carModel.find({ ownerId: user._id }).exec();
    return cars.map((car) => ({
      _id: car._id.toString(),
      registrationPlate: car.registrationPlate,
    }));
  }

  async findByOwner(ownerId: string): Promise<Car[]> {
    return this.carModel.find({ ownerId }).exec();
  }
}
