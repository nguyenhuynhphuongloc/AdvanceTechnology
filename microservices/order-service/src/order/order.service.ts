import { Injectable, Logger, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { RabbitMqService } from '../messaging/rabbitmq.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderEntity } from './entities/order.entity';

@Injectable()
export class OrderService implements OnModuleInit {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly rabbitMqService: RabbitMqService,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  async onModuleInit() {
    await this.rabbitMqService.subscribe(
      'order.inventory-failed',
      ['inventory.reservation_failed'],
      async (payload) => {
        await this.updateOrderStatus(payload.orderId, 'failed', payload.reason ?? 'inventory_failed');
      },
    );

    await this.rabbitMqService.subscribe(
      'order.payment-results',
      ['payment.succeeded', 'payment.failed'],
      async (payload, message) => {
        const status = message.fields.routingKey === 'payment.succeeded' ? 'confirmed' : 'failed';
        await this.updateOrderStatus(payload.orderId, status, payload.reason ?? null);
      },
    );
  }

  async createOrder(dto: CreateOrderDto) {
    const correlationId = randomUUID();
    const order = await this.orderRepository.save(
      this.orderRepository.create({
        status: 'pending',
        paymentMethod: dto.paymentMethod,
        totalAmount: dto.totalAmount,
        items: dto.items,
        recipientEmail: dto.recipientEmail ?? null,
        failureReason: null,
        correlationId,
      }),
    );

    try {
      await this.rabbitMqService.publish(
        'order.created',
        {
          orderId: order.id,
          correlationId,
          paymentMethod: order.paymentMethod,
          totalAmount: order.totalAmount,
          recipientEmail: order.recipientEmail,
          simulatePaymentFailure: dto.simulatePaymentFailure ?? false,
          items: order.items,
        },
        { correlationId },
      );
    } catch (error) {
      order.status = 'pending_publish_error';
      order.failureReason = error instanceof Error ? error.message : 'publish_failed';
      await this.orderRepository.save(order);
      throw new ServiceUnavailableException('Order persisted but event publication failed.');
    }

    return order;
  }

  getOrder(id: string) {
    return this.orderRepository.findOne({ where: { id } });
  }

  private async updateOrderStatus(id: string, status: string, failureReason: string | null) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      this.logger.warn(`Order ${id} not found for status update.`);
      return;
    }

    order.status = status;
    order.failureReason = failureReason;
    await this.orderRepository.save(order);
  }
}
