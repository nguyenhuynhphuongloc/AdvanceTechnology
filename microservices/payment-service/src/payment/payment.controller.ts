import { Controller, Get } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('api/v1/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('transactions')
  getTransactions() {
    return this.paymentService.getTransactions();
  }
}
