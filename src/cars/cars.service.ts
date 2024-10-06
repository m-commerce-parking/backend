import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCar } from 'src/interfaces/car.interface';
import { Car } from 'src/schemas/car.schema';

@Injectable()
export class CarsService {
  constructor(@InjectModel(Car.name) private carModel: Model<Car>) {}

  async createCar(carData: CreateCar) {
    const { registrationPlate, userId } = carData;
    try {
      await this.carModel.create({ registrationPlate, ownerId: userId });
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(
          'Car already exists or registration plate is invalid or already in use',
        );
      }
      throw error;
    }
    return { message: 'Car registered successfully' };
  }

  async findByOwner(ownerId: string): Promise<Car[]> {
    return this.carModel.find({ ownerId }).exec();
  }

  async remove(id: string): Promise<Car> {
    return this.carModel.findByIdAndDelete(id).exec();
  }
}
