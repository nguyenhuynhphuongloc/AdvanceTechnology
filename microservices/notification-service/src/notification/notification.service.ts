import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RabbitMqService } from '../messaging/rabbitmq.service';
import { AdminNotificationQueryDto } from './dto/admin-notification-query.dto';
import { NotificationLogEntity } from './entities/notification-log.entity';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService implements OnModuleInit {
  constructor(
    private readonly rabbitMqService: RabbitMqService,
    private readonly notificationGateway: NotificationGateway,
    @InjectRepository(NotificationLogEntity)
    private readonly notificationRepository: Repository<NotificationLogEntity>,
  ) {}

  async onModuleInit() {
    await this.rabbitMqService.subscribe(
      'notification.order-events',
      ['payment.succeeded', 'payment.failed', 'inventory.reservation_failed'],
      async (payload, message) => {
        const routingKey = message.fields.routingKey;
        
        // Log to database
        await this.notificationRepository.save(
          this.notificationRepository.create({
            orderId: payload.orderId,
            type: routingKey,
            recipient: payload.recipientEmail ?? null,
            status: 'sent',
            message: payload.reason ?? null,
          }),
        );

        // Send real-time notification via WebSocket
        this.notificationGateway.sendPaymentNotification(
          payload.orderId,
          routingKey.replace('.', '_'), // e.g., payment_succeeded
          {
            amount: payload.amount,
            transactionId: payload.transactionId,
            reason: payload.reason,
            clientSecret: payload.clientSecret,
          },
        );
      },
    );
  }

  getLogs() {
    return this.notificationRepository.find({ order: { createdAt: 'DESC' } });
  }

  async searchLogs(query: AdminNotificationQueryDto) {
    const qb = this.notificationRepository.createQueryBuilder('notification');

    if (query.type) {
      qb.andWhere('notification.type = :type', { type: query.type });
    }

    if (query.status) {
      qb.andWhere('notification.status = :status', { status: query.status });
    }

    if (query.search) {
      qb.andWhere(
        '(notification.orderId ILIKE :search OR notification.recipient ILIKE :search OR notification.message ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const items = await qb.orderBy('notification.createdAt', 'DESC').getMany();
    return {
      items,
      total: items.length,
    };
  }

  async getLogById(id: string) {
    return this.notificationRepository.findOne({ where: { id } });
  }
}
