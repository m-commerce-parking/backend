export interface FetchCar {
  _id: string;
  registrationPlate: string;
}

export interface CreateCar {
  registrationPlate: string;
  userId: string;
}
