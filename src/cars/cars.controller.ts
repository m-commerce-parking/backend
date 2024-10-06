import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CarsService } from './cars.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('cars')
export class CarsController {
  constructor(private carsService: CarsService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createCar(
    @Request() req,
    @Body() payload: { registrationPlate: string },
  ) {
    const { username } = req.user;
    const registrationPlate = payload.registrationPlate;
    return this.carsService.createCar({ registrationPlate, username });
  }

  @UseGuards(AuthGuard)
  @Delete(':carId')
  async removeCar(@Request() req, @Param('carId') carId: string) {
    const { username } = req.user;
    return this.carsService.removeCar(carId, username);
  }
}
