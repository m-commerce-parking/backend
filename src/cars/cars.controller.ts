import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CarsService } from './cars.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('cars')
@UseGuards(AuthGuard)
export class CarsController {
  constructor(private carsService: CarsService) {}

  @Post()
  async createCar(
    @Request() req,
    @Body() payload: { registrationPlate: string },
  ) {
    const { username } = req.user;
    const registrationPlate = payload.registrationPlate;
    return this.carsService.createCar({ registrationPlate, username });
  }

  @Delete(':carId')
  async removeCar(@Request() req, @Param('carId') carId: string) {
    const { username } = req.user;
    return this.carsService.removeCar(carId, username);
  }

  @Get()
  async getCars(@Req() req: Request) {
    const username = req['user'].username;
    const cars = await this.carsService.getCars(username);
    return {
      isSuccessful: true,
      message: 'Cars retrieved successfully',
      data: cars,
    };
  }
}
