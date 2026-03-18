import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RabbitMqService } from '../messaging/rabbitmq.service';
import { RedisService } from '../redis/redis.service';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { UpsertInventoryItemDto } from './dto/upsert-inventory-item.dto';
import { InventoryItemEntity } from './entities/inventory-item.entity';

type OrderItemEvent = {
  orderId: string;
  correlationId?: string;
  paymentMethod?: string;
  totalAmount?: number;
  recipientEmail?: string | null;
  simulatePaymentFailure?: boolean;
  items: Array<{ variantId: string; quantity: number; unitPrice: number }>;
};

@Injectable()
export class InventoryService implements OnModuleInit {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly rabbitMqService: RabbitMqService,
    @InjectRepository(InventoryItemEntity)
    private readonly inventoryRepository: Repository<InventoryItemEntity>,
  ) {}

  async onModuleInit() {
    await this.rabbitMqService.subscribe(
      'inventory.order-created',
      ['order.created'],
      async (payload: OrderItemEvent) => {
        await this.handleOrderCreated(payload);
      },
    );

    await this.rabbitMqService.subscribe(
      'inventory.order-outcomes',
      ['payment.failed', 'payment.succeeded', 'order.cancelled'],
      async (payload, message) => {
        if (message.fields.routingKey === 'payment.succeeded') {
          await this.finalizeReservation(payload.orderId, payload.items ?? []);
          return;
        }

        await this.releaseReservation(payload.orderId, payload.items ?? []);
      },
    );
  }

  async upsertItem(dto: UpsertInventoryItemDto) {
    const existing = await this.inventoryRepository.findOne({ where: { variantId: dto.variantId } });
    if (existing) {
      existing.productId = dto.productId ?? existing.productId;
      existing.sku = dto.sku ?? existing.sku;
      existing.stock = dto.stock;
      return this.toInventoryRecord(await this.inventoryRepository.save(existing));
    }

    return this.toInventoryRecord(await this.inventoryRepository.save(
      this.inventoryRepository.create({
        productId: dto.productId ?? null,
        variantId: dto.variantId,
        sku: dto.sku ?? null,
        stock: dto.stock,
        reservedStock: 0,
      }),
    ));
  }

  getItem(variantId: string) {
    return this.inventoryRepository.findOne({ where: { variantId } }).then((item) => (item ? this.toInventoryRecord(item) : null));
  }

  async search(query: InventoryQueryDto) {
    const qb = this.inventoryRepository.createQueryBuilder('inventory');
    if (query.productId) {
      qb.andWhere('inventory.productId = :productId', { productId: query.productId });
    }
    if (query.variantId) {
      qb.andWhere('inventory.variantId = :variantId', { variantId: query.variantId });
    }
    if (query.sku) {
      qb.andWhere('inventory.sku = :sku', { sku: query.sku });
    }

    const items = await qb.orderBy('inventory.updatedAt', 'DESC').getMany();
    return {
      items: items.map((item) => this.toInventoryRecord(item)),
      total: items.length,
    };
  }

  async updateStock(id: string, stock: number) {
    const item = await this.inventoryRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Inventory record with id "${id}" was not found.`);
    }

    item.stock = stock;
    const saved = await this.inventoryRepository.save(item);
    return this.toInventoryRecord(saved);
  }

  async handleOrderCreated(payload: OrderItemEvent) {
    const items = await Promise.all(
      payload.items.map((item) =>
        this.inventoryRepository.findOne({ where: { variantId: item.variantId } }),
      ),
    );

    const missingIndex = items.findIndex((item) => !item);
    if (missingIndex >= 0) {
      await this.rabbitMqService.publish(
        'inventory.reservation_failed',
        {
          orderId: payload.orderId,
          correlationId: payload.correlationId,
          reason: `variant_not_found:${payload.items[missingIndex].variantId}`,
          items: payload.items,
        },
        { correlationId: payload.correlationId },
      );
      return;
    }

    for (let index = 0; index < items.length; index += 1) {
      const inventoryItem = items[index]!;
      const requestItem = payload.items[index];
      if (inventoryItem.stock - inventoryItem.reservedStock < requestItem.quantity) {
        await this.rabbitMqService.publish(
          'inventory.reservation_failed',
          {
            orderId: payload.orderId,
            correlationId: payload.correlationId,
            reason: `insufficient_stock:${requestItem.variantId}`,
            items: payload.items,
          },
          { correlationId: payload.correlationId },
        );
        return;
      }
    }

    for (let index = 0; index < items.length; index += 1) {
      const inventoryItem = items[index]!;
      const requestItem = payload.items[index];
      inventoryItem.reservedStock += requestItem.quantity;
      await this.inventoryRepository.save(inventoryItem);
      await this.redisService.setJson(
        this.getHoldKey(payload.orderId, requestItem.variantId),
        requestItem,
        this.getHoldTtl(),
      );
    }

    await this.rabbitMqService.publish(
      'inventory.reserved',
      payload,
      { correlationId: payload.correlationId },
    );
  }

  async releaseReservation(orderId: string, items: Array<{ variantId: string; quantity: number }>) {
    for (const item of items) {
      const inventoryItem = await this.inventoryRepository.findOne({ where: { variantId: item.variantId } });
      if (inventoryItem) {
        inventoryItem.reservedStock = Math.max(0, inventoryItem.reservedStock - item.quantity);
        await this.inventoryRepository.save(inventoryItem);
      }
      await this.redisService.delete(this.getHoldKey(orderId, item.variantId));
    }
  }

  async finalizeReservation(orderId: string, items: Array<{ variantId: string; quantity: number }>) {
    for (const item of items) {
      const inventoryItem = await this.inventoryRepository.findOne({ where: { variantId: item.variantId } });
      if (!inventoryItem) {
        this.logger.warn(`Missing inventory item for ${item.variantId} while finalizing ${orderId}`);
        continue;
      }

      inventoryItem.stock = Math.max(0, inventoryItem.stock - item.quantity);
      inventoryItem.reservedStock = Math.max(0, inventoryItem.reservedStock - item.quantity);
      await this.inventoryRepository.save(inventoryItem);
      await this.redisService.delete(this.getHoldKey(orderId, item.variantId));
    }
  }

  private getHoldKey(orderId: string, variantId: string) {
    return `inventory:hold:${orderId}:${variantId}`;
  }

  private getHoldTtl() {
    const value = Number(this.configService.get<string>('INVENTORY_HOLD_TTL_SECONDS') ?? 600);
    return Number.isFinite(value) && value > 0 ? value : 600;
  }

  private toInventoryRecord(item: InventoryItemEntity) {
    const available = Math.max(0, item.stock - item.reservedStock);
    let status = 'in-stock';
    if (available === 0) {
      status = 'out-of-stock';
    } else if (available <= 5) {
      status = 'low-stock';
    }

    return {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      sku: item.sku,
      stock: item.stock,
      reservedStock: item.reservedStock,
      availableStock: available,
      status,
      updatedAt: item.updatedAt,
    };
  }
}
