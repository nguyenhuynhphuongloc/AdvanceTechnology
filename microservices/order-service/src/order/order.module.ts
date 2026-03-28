import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMqModule } from '../messaging/rabbitmq.module';
import { AdminOrderController, OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderEntity } from './entities/order.entity';

@Module({
  imports: [RabbitMqModule, TypeOrmModule.forFeature([OrderEntity])],
  controllers: [OrderController, AdminOrderController],
  providers: [OrderService],
})
export class OrderModule {}
