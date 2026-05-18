import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RabbitMqService } from '../messaging/rabbitmq.service';
import { AdminNotificationQueryDto } from './dto/admin-notification-query.dto';
import { NotificationLogEntity, NotificationChannel, NotificationStatus } from './entities/notification-log.entity';
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

        const log = new NotificationLogEntity();
        log.authUserId = null;
        log.recipient = payload.recipientEmail ?? 'unknown';
        log.type = routingKey as any;
        log.channel = NotificationChannel.WEBHOOK;
        log.status = NotificationStatus.SENT;
        log.errorMsg = payload.reason ?? null;
        log.sentAt = new Date();
        await this.notificationRepository.save(log);

        this.notificationGateway.sendPaymentNotification(
          payload.orderId,
          routingKey.replace('.', '_'),
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
    return this.notificationRepository.find({ order: { id: 'DESC' } });
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
        '(notification.recipient ILIKE :search OR notification.errorMsg ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const items = await qb.orderBy('notification.id', 'DESC').getMany();
    return {
      items,
      total: items.length,
    };
  }

  async getLogById(id: string) {
    return this.notificationRepository.findOne({ where: { id } });
  }
}
