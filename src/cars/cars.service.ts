import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCar } from 'src/interfaces/car.interface';
import { Car } from 'src/schemas/car.schema';
import { UserService } from 'src/user/user.service';

@Injectable()
export class CarsService {
  constructor(
    @InjectModel(Car.name) private carModel: Model<Car>,
    private usersService: UserService,
    private log: Logger,
  ) {}

  async createCar(carData: CreateCar) {
    const { registrationPlate, username } = carData;
    try {
      const user = await this.usersService.findOne(username);
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
    const user = await this.usersService.findOne(username);
    return this.carModel
      .deleteOne({ _id: new Types.ObjectId(carId), ownerId: user._id })
      .exec();
  }

  async findByOwner(ownerId: string): Promise<Car[]> {
    return this.carModel.find({ ownerId }).exec();
  }
}
