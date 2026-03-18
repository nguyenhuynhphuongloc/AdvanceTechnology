import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMqModule } from '../messaging/rabbitmq.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentTransactionEntity } from './entities/payment-transaction.entity';

@Module({
  imports: [RabbitMqModule, TypeOrmModule.forFeature([PaymentTransactionEntity])],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
