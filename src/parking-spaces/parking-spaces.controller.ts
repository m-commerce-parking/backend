import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ParkingSpacesService } from './parking-spaces.service';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';
import {
  OrderParkingSpaceDto,
  ParkingSpaceInfoDto,
  ParkingSpaceResponseDto,
} from './dto/order-parking-space.dto';

@Controller('parking-spaces')
@UseGuards(AuthGuard)
export class ParkingSpacesController {
  constructor(private readonly parkingSpacesService: ParkingSpacesService) {}

  @Post('order')
  async orderParkingSpace(
    @Body() orderParkingSpaceDto: OrderParkingSpaceDto,
    @Req() req: Request,
  ) {
    const username = req['user'].username;
    const parkingAction = await this.parkingSpacesService.orderParkingSpace(
      orderParkingSpaceDto.selectedCar,
      username,
    );

    return {
      isSuccessful: true,
      message: 'Parking space ordered',
      data: {
        _id: parkingAction._id.toString(),
        parkingSpaceId: parkingAction.parkingSpaceId.toString(),
        parkingSpaceNumber: parkingAction.parkingSpaceNumber,
        carId: parkingAction.carId.toString(),
        status: parkingAction.status,
        parkTime: parkingAction.parkTime,
        leaveTime: parkingAction.leaveTime,
      },
    };
  }

  @Get()
  async getParkingSpaces(): Promise<{
    isSuccessful: boolean;
    message: string;
    data: ParkingSpaceResponseDto[];
  }> {
    const parkingSpaces = await this.parkingSpacesService.getParkingSpaces();
    return {
      isSuccessful: true,
      message: 'Parking spaces retrieved successfully',
      data: parkingSpaces,
    };
  }

  @Get(':spaceNumber')
  async getParkingSpaceInfo(
    @Param('spaceNumber', ParseIntPipe) spaceNumber: number,
  ): Promise<{
    isSuccessful: boolean;
    message: string;
    data: ParkingSpaceInfoDto;
  }> {
    const parkingSpaceInfo =
      await this.parkingSpacesService.getParkingSpaceInfo(spaceNumber);
    return {
      isSuccessful: true,
      message: 'Parking space info retrieved successfully',
      data: parkingSpaceInfo,
    };
  }
}
