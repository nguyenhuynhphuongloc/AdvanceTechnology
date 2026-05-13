import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
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
    if (!process.env.RABBITMQ_URL || process.env.RABBITMQ_ENABLED === 'false') {
      return;
    }

    await this.rabbitMqService.subscribe(
      'order.inventory-failed',
      ['inventory.reservation_failed'],
      async (payload) => {
        await this.updateOrderStatus(payload.orderId, 'failed', payload.reason ?? 'inventory_failed');
      },
    );

    await this.rabbitMqService.subscribe(
      'order.inventory-reserved',
      ['inventory.reserved'],
      async (payload) => {
        await this.updateOrderStatus(payload.orderId, 'awaiting_payment', null);
      },
    );

    await this.rabbitMqService.subscribe(
      'order.payment-results',
      ['payment.succeeded', 'payment.failed'],
      async (payload, message) => {
        // Status changes to awaiting_approval after payment success
        const status = message.fields.routingKey === 'payment.succeeded' ? 'awaiting_approval' : 'failed';
        await this.updateOrderStatus(payload.orderId, status, payload.reason ?? null);
      },
    );
  }

  async createOrder(dto: CreateOrderDto) {
    this.logger.debug(`Creating order with data: ${JSON.stringify(dto)}`);
    const correlationId = randomUUID();
    const items = dto.items || [];
    const subtotal = items.reduce(
      (acc, item) => acc + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0),
      0,
    );
    const shippingFee = dto.totalAmount - subtotal > 0 ? dto.totalAmount - subtotal : 0;

    const order = await this.orderRepository.save(
      this.orderRepository.create({
        status: 'pending',
        paymentMethod: dto.paymentMethod,
        subtotal,
        shippingFee,
        totalAmount: dto.totalAmount || (subtotal + shippingFee),
        isGuest: dto.isGuest ?? (dto.authUserId ? false : true),
        authUserId: dto.authUserId ?? null,
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

  async getUserOrders(authUserId: string) {
    return this.orderRepository.find({
      where: { authUserId },
      order: { createdAt: 'DESC' },
    });
  }

  async approveOrder(id: string) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with id "${id}" was not found.`);
    }

    if (order.status !== 'awaiting_approval') {
      throw new Error(`Order cannot be approved in current status: ${order.status}`);
    }

    order.status = 'shipping';
    return this.orderRepository.save(order);
  }

  async deliverOrder(id: string) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with id "${id}" was not found.`);
    }

    order.status = 'delivered';
    return this.orderRepository.save(order);
  }

  getOrder(id: string) {
    return this.orderRepository.findOne({ where: { id } });
  }

  async listAdminOrders() {
    const orders = await this.orderRepository.find({
      order: { createdAt: 'DESC' },
    });

    return {
      items: orders.map((order) => this.toAdminOrderResponse(order)),
      total: orders.length,
    };
  }

  async getAdminOrder(id: string) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with id "${id}" was not found.`);
    }

    return this.toAdminOrderResponse(order);
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

  private toAdminOrderResponse(order: OrderEntity) {
    return {
      id: order.id,
      status: order.status,
      paymentMethod: order.paymentMethod,
      totalAmount: Number(order.totalAmount),
      recipientEmail: order.recipientEmail,
      failureReason: order.failureReason,
      correlationId: order.correlationId,
      items: order.items,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
