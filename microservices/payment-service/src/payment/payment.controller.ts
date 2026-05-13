import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('api/v1/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('transactions')
  getTransactions() {
    return this.paymentService.getTransactions();
  }

  @Get('order/:orderId')
  getPaymentByOrderId(@Param('orderId') orderId: string) {
    return this.paymentService.getPaymentByOrderId(orderId);
  }

  @Post('create-intent')
  createPaymentIntent(@Body() body: { orderId: string; amount: number; currency?: string }) {
    return this.paymentService.createPaymentIntent(body);
  }
}
