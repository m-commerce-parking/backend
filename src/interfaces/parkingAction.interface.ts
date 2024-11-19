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

export interface PayParkingResponse {
    parkingActionId: string;
    newUserCredits: number;
}

export interface FetchFilteredActions {
    parkingSpaceNumber: number;
    status: string;
    parkTime: Date;
    leaveTime: Date | null;
    carRegistrationPlate: string;
}

export interface FetchFilteredActionsRequest {
    currentState: unknown;
    spot: number;
    status: string;
    licensePlate: string;
}

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
