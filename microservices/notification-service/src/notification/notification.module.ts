import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMqModule } from '../messaging/rabbitmq.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationLogEntity } from './entities/notification-log.entity';

@Module({
  imports: [RabbitMqModule, TypeOrmModule.forFeature([NotificationLogEntity])],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
