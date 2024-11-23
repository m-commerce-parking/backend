import {
  Body,
  Controller,
  Post,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';
import Stripe from 'stripe';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly userService: UserService,
  ) {}

  @Post('create-payment-intent')
  async createPaymentIntent(@Body() body: { amount: number }) {
    const { amount } = body;

    if (amount <= 0) {
      return {
        message: 'Invalid amount',
        status: HttpStatus.BAD_REQUEST,
      };
    }

    const paymentIntent = await this.stripeService.createPaymentIntent(
      amount * 100,
      'pln',
    );

    return {
      clientSecret: paymentIntent.client_secret,
      status: HttpStatus.OK,
    };
  }

  @Post('webhook')
  async handleStripeWebhook(@Req() req: Request, @Body() body: { userId: string }) {
    const signature = req.headers['stripe-signature'];

    try {
      const event = this.stripeService.verifyWebhook(
        signature as string,
        req.body,
      );

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        const creditsToAdd = paymentIntent.amount / 100;
        await this.userService.addFunds(body.userId, creditsToAdd);
      }
    } catch (_error) {
      return {
        message: 'Webhook verification failed',
        status: HttpStatus.BAD_REQUEST,
      };
    }
      return {
        message: 'Webhook handled successfully',
        status: HttpStatus.OK,
    };
  }
}
