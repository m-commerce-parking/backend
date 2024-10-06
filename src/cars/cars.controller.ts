import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
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
    const { id } = req.user;
    const registrationPlate = payload.registrationPlate;
    return this.carsService.createCar({ registrationPlate, userId: id });
  }
}
