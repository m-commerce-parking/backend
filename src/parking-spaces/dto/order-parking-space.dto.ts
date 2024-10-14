import { IsNotEmpty, IsString } from 'class-validator';

export class OrderParkingSpaceDto {
  @IsNotEmpty()
  @IsString()
  selectedCar: string;
}

export class ParkingSpaceResponseDto {
  _id: string;
  spaceNumber: number;
  status: string;
}

export class ParkingSpaceInfoDto {
  carRegistrationPlate: string | null;
  parkTime: Date | null;
}
