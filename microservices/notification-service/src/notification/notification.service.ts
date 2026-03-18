import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RabbitMqService } from '../messaging/rabbitmq.service';
import { NotificationLogEntity } from './entities/notification-log.entity';

@Injectable()
export class NotificationService implements OnModuleInit {
  constructor(
    private readonly rabbitMqService: RabbitMqService,
    @InjectRepository(NotificationLogEntity)
    private readonly notificationRepository: Repository<NotificationLogEntity>,
  ) {}

  async onModuleInit() {
    await this.rabbitMqService.subscribe(
      'notification.order-events',
      ['payment.succeeded', 'payment.failed', 'inventory.reservation_failed'],
      async (payload, message) => {
        await this.notificationRepository.save(
          this.notificationRepository.create({
            orderId: payload.orderId,
            type: message.fields.routingKey,
            recipient: payload.recipientEmail ?? null,
            status: 'sent',
            message: payload.reason ?? null,
          }),
        );
      },
    );
  }

  getLogs() {
    return this.notificationRepository.find({ order: { createdAt: 'DESC' } });
  }
}
