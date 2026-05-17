import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMqModule } from '../messaging/rabbitmq.module';
import { AdminPaymentController, PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentTransactionEntity } from './entities/payment-transaction.entity';
import { RefundEntity } from './entities/refund.entity';

@Module({
  imports: [RabbitMqModule, TypeOrmModule.forFeature([PaymentTransactionEntity, RefundEntity])],
  controllers: [PaymentController, AdminPaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
