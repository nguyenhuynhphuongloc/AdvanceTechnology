import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

type CartSnapshotItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
};

type CartSnapshot = {
  userId: number;
  items: CartSnapshotItem[];
  subtotal: number;
};

@Injectable()
export class OrdersService {
  private readonly cartServiceUrl: string;

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.cartServiceUrl =
      this.configService.get<string>('CART_SERVICE_URL') ?? 'http://localhost:3002';
  }

  async createOrder(userId: number, _dto: CreateOrderDto, idempotencyKey?: string) {
    const normalizedKey = idempotencyKey?.trim();

    if (normalizedKey) {
      const existingOrder = await this.orderRepository.findOne({
        where: { userId, idempotencyKey: normalizedKey },
      });

      if (existingOrder) {
        return this.toOrderResponse(existingOrder);
      }
    }

    const cart = await this.getCartSnapshot(userId);

    if (cart.items.length === 0) {
      throw new BadRequestException('cannot checkout an empty cart');
    }

    const savedOrder = await this.dataSource.transaction(async (manager) => {
      const totalAmount = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      );

      const order = manager.create(Order, {
        userId,
        status: 'PENDING',
        totalAmount: totalAmount.toFixed(2),
        idempotencyKey: normalizedKey ?? null,
      });

      const persistedOrder = await manager.save(order);

      const orderItems = cart.items.map((item) =>
        manager.create(OrderItem, {
          order: persistedOrder,
          productId: item.productId,
          name: item.name,
          price: item.price.toFixed(2),
          quantity: item.quantity,
          lineTotal: (item.price * item.quantity).toFixed(2),
        }),
      );

      await manager.save(orderItems);
      return manager.findOneOrFail(Order, {
        where: { id: persistedOrder.id },
      });
    });

    await this.clearCart(userId);

    return this.toOrderResponse(savedOrder);
  }

  async listOrders(userId: number) {
    const orders = await this.orderRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return orders.map((order) => this.toOrderResponse(order));
  }

  async getOrderById(userId: number, orderId: number) {
    const order = await this.orderRepository.findOne({ where: { id: orderId, userId } });

    if (!order) {
      throw new NotFoundException('order not found');
    }

    return this.toOrderResponse(order);
  }

  async cancelOrder(userId: number, orderId: number) {
    const order = await this.orderRepository.findOne({ where: { id: orderId, userId } });

    if (!order) {
      throw new NotFoundException('order not found');
    }

    if (order.status === 'CANCELLED') {
      return this.toOrderResponse(order);
    }

    order.status = 'CANCELLED';
    const updated = await this.orderRepository.save(order);
    return this.toOrderResponse(updated);
  }

  private async getCartSnapshot(userId: number) {
    const response = await fetch(`${this.cartServiceUrl}/cart/internal/${userId}`);

    if (!response.ok) {
      throw new BadGatewayException('failed to fetch cart from cart-service');
    }

    return (await response.json()) as CartSnapshot;
  }

  private async clearCart(userId: number) {
    const response = await fetch(`${this.cartServiceUrl}/cart/internal/${userId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new BadGatewayException('order created but failed to clear cart');
    }
  }

  private toOrderResponse(order: Order) {
    const items = [...(order.items ?? [])].map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.name,
      price: Number(item.price),
      quantity: item.quantity,
      lineTotal: Number(item.lineTotal),
    }));

    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      idempotencyKey: order.idempotencyKey ?? null,
      items,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
