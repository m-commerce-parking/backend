import {
    Controller,
    Get,
    UseGuards,
    Request,
    Post,
    Body,
    Param,
} from '@nestjs/common';
import { ParkingActionService } from './parking-action.service';
import { AuthGuard } from 'src/auth/auth.guard';
import {
    FetchFilteredActions,
    FetchFilteredActionsRequest,
    FetchParkingAction,
    PayParkingResponse,
} from 'src/interfaces/parkingAction.interface';
import { PayParkingDto } from './dto/parking-action.dto';

@UseGuards(AuthGuard)
@Controller('parking-action')
export class ParkingActionController {
    constructor(private parkingActionService: ParkingActionService) {}

    @Get('user-actions')
    async getUserParkingActions(@Request() req): Promise<FetchParkingAction[]> {
        const { username } = req.user;
        return this.parkingActionService.getUserParkingActions(username);
    }

    @Post('pay')
    async payParkingAction(
        @Request() req,
        @Body() payParking: PayParkingDto,
    ): Promise<PayParkingResponse> {
        const { username } = req.user;
        return this.parkingActionService.payParking(
            username,
            payParking.amount,
            payParking.carLicense,
        );
    }

    @Get('pending-payment/:id')
    async getPendingPayment(@Param('id') pendingPaymentId: string) {
        return this.parkingActionService.getPendingPayment(pendingPaymentId);
    }

    @Get('filtered-actions')
    async fetchFilteredActions(
        @Body() params: FetchFilteredActionsRequest,
    ): Promise<FetchFilteredActions[]> {
        return this.parkingActionService.fetchFilteredActions(params);
    }
}
