import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AdminPaymentQueryDto } from './dto/admin-payment-query.dto';
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

  @Post('transactions')
  createTransaction(@Body() body: { orderId: string; method: string; amount: number; status?: string }) {
    return this.paymentService.createTransaction(body);
  }
}

@Controller('api/v1/admin/payments')
export class AdminPaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  getTransactions(@Query() query: AdminPaymentQueryDto) {
    return this.paymentService.searchTransactions(query);
  }

  @Get(':id')
  getTransaction(@Param('id') id: string) {
    return this.paymentService.getTransactionById(id);
  }
}
