import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
    parkingActionStatusEnum,
    parkingSpaceStatusEnum,
} from 'src/constants/enums';
import {
    FetchFilteredActions,
    FetchFilteredActionsRequest,
    FetchParkingAction,
    PayParkingResponse,
} from 'src/interfaces/parkingAction.interface';
import { Car } from 'src/schemas/car.schema';
import { ParkingAction } from 'src/schemas/parkingAction.schema';
import { ParkingSpace } from 'src/schemas/parkingSpace.schema';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class ParkingActionService {
    constructor(
        @InjectModel(ParkingAction.name)
        private parkingActionModel: Model<ParkingAction>,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Car.name) private carModel: Model<Car>,
        @InjectModel(ParkingSpace.name)
        private parkingSpaceModel: Model<ParkingSpace>,
    ) {}

    async getUserParkingActions(
        username: string,
    ): Promise<FetchParkingAction[]> {
        try {
            const userInfo = await this.userModel.findOne({ username });
            if (!userInfo) {
                throw new BadRequestException('User not found');
            }

            const userCars = await this.carModel.find({
                ownerId: userInfo._id,
            });
            const userCarsIds = userCars.map((car) => car._id);

            const parkingActions = await this.parkingActionModel
                .find({
                    carId: { $in: userCarsIds },
                })
                .populate('parkingSpaceId')
                .populate('carId')
                .exec();

            return parkingActions.map((action) => ({
                id: action._id.toString(),
                parkingSpaceId: action.parkingSpaceId._id.toString(),
                parkingSpaceNumber: action.parkingSpaceNumber,
                carId: action.carId._id.toString(),
                carRegistrationPlate: (action.carId as any).registrationPlate,
                status: action.status,
                parkTime: action.parkTime,
                leaveTime: action.leaveTime,
            }));
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async payParking(
        username: string,
        amount: number,
        carLicense: string,
    ): Promise<PayParkingResponse> {
        try {
            const user = await this.userModel.findOne({ username });
            if (!user) {
                throw new BadRequestException('User not found');
            }

            if (user.credits < amount) {
                throw new BadRequestException('Not enough credits');
            }

            const car = await this.carModel.findOne({
                registrationPlate: carLicense,
                ownerId: user._id,
            });
            if (!car) {
                throw new BadRequestException('Car not found');
            }

            const parkingAction = await this.parkingActionModel.findOne({
                carId: car._id,
                status: parkingActionStatusEnum.pending,
            });
            if (!parkingAction) {
                throw new BadRequestException('Parking action not found');
            }

            await this.userModel.updateOne(
                { username },
                { $inc: { credits: -amount } },
            );

            await this.parkingActionModel.updateOne(
                { _id: parkingAction._id },
                {
                    status: parkingActionStatusEnum.paid,
                    leaveTime: new Date(),
                },
            );

            await this.parkingSpaceModel.updateOne(
                { _id: parkingAction.parkingSpaceId },
                { status: parkingSpaceStatusEnum.free },
            );

            const newUserCredits = user.credits - amount;
            return {
                parkingActionId: parkingAction._id.toString(),
                newUserCredits,
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async getPendingPayment(pendingPaymentId: string) {
        try {
            const pendingPayment = await this.parkingActionModel
                .findOne({
                    _id: pendingPaymentId,
                    status: parkingActionStatusEnum.pending,
                })
                .populate('carId')
                .populate('parkingSpaceId');

            if (!pendingPayment) {
                throw new NotFoundException('Pending payment not found');
            }

            return {
                isSuccessful: true,
                message: 'Pending payment found',
                data: {
                    id: pendingPayment._id.toString(),
                    parkingSpaceId: pendingPayment.parkingSpaceId.toString(),
                    parkingSpaceNumber: (
                        pendingPayment.parkingSpaceId as unknown as ParkingSpace
                    ).spaceNumber,
                    carId: pendingPayment.carId.toString(),
                    carRegistrationPlate: (
                        pendingPayment.carId as unknown as Car
                    ).registrationPlate,
                    status: pendingPayment.status,
                    parkTime: pendingPayment.parkTime,
                    leaveTime: pendingPayment.leaveTime,
                },
            };
        } catch (error) {
            console.error(error);
            return {
                isSuccessful: false,
                message: error.message || 'Error fetching pending payment',
                data: null,
            };
        }
    }

    async getLastParkingAction(username: string): Promise<FetchParkingAction | null> {
        try {
            const user = await this.userModel.findOne({ username });
            if (!user) {
                throw new BadRequestException('User not found');
            }

            const userCars = await this.carModel.find({
                ownerId: user._id,
            });
            const userCarsIds = userCars.map((car) => car._id);

            const parkingActions = await this.parkingActionModel
                .find({
                    carId: { $in: userCarsIds },
                })
                .populate('parkingSpaceId')
                .populate('carId')
                .sort({ parkTime: -1 })
                .limit(1)
                .exec();

            if (!parkingActions || parkingActions.length !== 1) {
                return null;
            }

            const parkingAction = parkingActions[0];

            return {
                id: parkingAction._id.toString(),
                parkingSpaceId: parkingAction.parkingSpaceId._id.toString(),
                parkingSpaceNumber: parkingAction.parkingSpaceNumber,
                carId: parkingAction.carId._id.toString(),
                carRegistrationPlate: (parkingAction.carId as any).registrationPlate,
                status: parkingAction.status,
                parkTime: parkingAction.parkTime,
                leaveTime: parkingAction.leaveTime,
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async fetchFilteredActions(
        filterParams: FetchFilteredActionsRequest,
    ): Promise<FetchFilteredActions[]> {
        try {
            const parkingActions = await this.parkingActionModel
                .find()
                .populate('parkingSpaceId')
                .populate('carId')
                .exec();

            const actionsList = parkingActions.map((action) => {
                if (!action.carId || !action.parkingSpaceId) {
                    throw new BadRequestException(
                        'Invalid parking action: missing car or parking space details',
                    );
                }

                return {
                    id: action._id.toString(),
                    parkingSpaceId: action.parkingSpaceId._id.toString(),
                    parkingSpaceNumber: (action.parkingSpaceId as any)
                        .spaceNumber,
                    carId: action.carId._id.toString(),
                    carRegistrationPlate: (action.carId as any)
                        .registrationPlate,
                    status: action.status,
                    parkTime: action.parkTime,
                    leaveTime: action.leaveTime,
                };
            });

            return this.filterList(
                actionsList,
                filterParams.spot,
                filterParams.licensePlate,
                filterParams.status,
            );
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async filterList(
        myList: {
            parkingSpaceNumber: number;
            status: string;
            parkTime: Date;
            leaveTime: Date | null;
            carRegistrationPlate: string;
        }[],
        spot?: number,
        license?: string,
        status?: string,
    ): Promise<FetchFilteredActions[]> {
        return myList.filter((item) => {
            const spotCondition =
                spot !== undefined ? item.parkingSpaceNumber === spot : true;
            const licenseCondition = license
                ? item.carRegistrationPlate === license
                : true;
            const statusCondition = status ? item.status === status : true;

            return spotCondition && licenseCondition && statusCondition;
        });
    }
}
