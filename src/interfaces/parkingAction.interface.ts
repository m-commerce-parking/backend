export interface FetchParkingAction {
  id: string;
  parkingSpaceId: string;
  parkingSpaceNumber: number;
  carId: string;
  carRegistrationPlate: string;
  status: string;
  parkTime: Date;
  leaveTime: Date | null;
}
