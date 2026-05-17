import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RabbitMqService } from '../messaging/rabbitmq.service';
import { RedisService } from '../redis/redis.service';
import { BranchService } from '../branch/branch.service';
import {
  InventoryQueryDto,
  SellerInventoryQueryDto,
  CreateInventoryItemDto,
  UpdateInventoryStockDto,
} from './dto/inventory.dto';
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

interface ProductVariantInternal {
  productId: string;
  variantId: string;
  shopId: string | null;
  sellerId: string | null;
  productName: string;
  variantName: string;
  sku: string;
  imageUrl: string | null;
  unitPrice: number;
  approvalStatus: string;
  isActive: boolean;
}

interface ShopInternal {
  id: string;
  sellerId: string;
  name: string;
  slug: string;
  status: string;
}

@Injectable()
export class InventoryService implements OnModuleInit {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly rabbitMqService: RabbitMqService,
    private readonly branchService: BranchService,
    @InjectRepository(InventoryItemEntity)
    private readonly inventoryRepository: Repository<InventoryItemEntity>,
  ) {}

  async onModuleInit() {
    const rabbitmqEnabled = this.configService.get<string>('RABBITMQ_ENABLED', 'false') === 'true';
    if (!rabbitmqEnabled) {
      return;
    }

    await this.rabbitMqService.subscribe(
      'inventory.order-created',
      ['order.created'],
      async (payload: OrderItemEvent) => {
        await this.handleOrderCreated(payload);
      },
    );

    await this.rabbitMqService.subscribe(
      'inventory.product-created',
      ['product.created'],
      async (payload: { productId: string; shopId?: string; variants: Array<{ variantId: string; sku: string }> }) => {
        await this.handleProductCreated(payload);
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

  async handleProductCreated(payload: { productId: string; shopId?: string; variants: Array<{ variantId: string; sku: string }> }) {
    const shopId = payload.shopId ?? null;

    for (const variant of payload.variants) {
      const existing = await this.inventoryRepository.findOne({
        where: { variantId: variant.variantId, shopId: shopId ?? undefined },
      });

      if (existing) {
        this.logger.log(`Inventory item already exists for variant ${variant.variantId} at shop ${shopId}, skipping.`);
        continue;
      }

      await this.inventoryRepository.save(
        this.inventoryRepository.create({
          productId: payload.productId,
          variantId: variant.variantId,
          shopId,
          sku: variant.sku,
          stock: 0,
          reservedStock: 0,
          lowStockThreshold: 10,
        }),
      );
      this.logger.log(`Created inventory item for variant ${variant.variantId} at shop ${shopId}`);
    }
  }

  async upsertItem(dto: UpsertInventoryItemDto): Promise<any> {
    const where: any = dto.shopId
      ? { variantId: dto.variantId, shopId: dto.shopId }
      : dto.branchId
      ? { variantId: dto.variantId, branchId: dto.branchId }
      : { variantId: dto.variantId, shopId: undefined };

    const existing = await this.inventoryRepository.findOne({ where });
    if (existing) {
      existing.productId = dto.productId ?? existing.productId;
      existing.sku = dto.sku ?? existing.sku;
      existing.stock = dto.stock;
      existing.lowStockThreshold = dto.lowStockThreshold ?? existing.lowStockThreshold;
      return this.toInventoryRecord(await this.inventoryRepository.save(existing));
    }

    return this.toInventoryRecord(await this.inventoryRepository.save(
      this.inventoryRepository.create({
        productId: dto.productId ?? null,
        variantId: dto.variantId,
        shopId: dto.shopId ?? null,
        branchId: dto.branchId ?? null,
        sku: dto.sku ?? null,
        stock: dto.stock,
        reservedStock: 0,
        lowStockThreshold: dto.lowStockThreshold ?? 10,
      }),
    ));
  }

  async getItem(variantId: string): Promise<any | null> {
    const item = await this.inventoryRepository.findOne({ where: { variantId } });
    return item ? this.toInventoryRecord(item) : null;
  }

  async search(query: InventoryQueryDto): Promise<{ items: any[]; total: number }> {
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
    if (query.branchId) {
      qb.andWhere('inventory.branchId = :branchId', { branchId: query.branchId });
    }
    if (query.shopId) {
      qb.andWhere('inventory.shopId = :shopId', { shopId: query.shopId });
    }
    if (query.lowStockOnly) {
      qb.andWhere('inventory.stock - inventory.reservedStock <= inventory.lowStockThreshold');
    }

    const items = await qb.orderBy('inventory.updatedAt', 'DESC').getMany();
    return {
      items: items.map((item) => this.toInventoryRecord(item)),
      total: items.length,
    };
  }

  async updateStock(id: string, stock: number): Promise<any> {
    const item = await this.inventoryRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Inventory record with id "${id}" was not found.`);
    }

    item.stock = stock;
    const saved = await this.inventoryRepository.save(item);
    return this.toInventoryRecord(saved);
  }

  // ─── Seller Inventory ─────────────────────────────────────────────────────────

  async listSellerInventory(sellerId: string, query: SellerInventoryQueryDto): Promise<{ items: any[]; total: number }> {
    const shop = await this.getShopBySellerId(sellerId);
    if (!shop) {
      return { items: [], total: 0 };
    }

    const qb = this.inventoryRepository.createQueryBuilder('inventory');
    qb.andWhere('inventory.shopId = :shopId', { shopId: shop.id });

    if (query.productId) {
      qb.andWhere('inventory.productId = :productId', { productId: query.productId });
    }

    if (query.lowStockOnly) {
      qb.andWhere('inventory.stock - inventory.reservedStock <= inventory.lowStockThreshold');
    }

    if (query.search) {
      qb.andWhere(
        '(inventory.sku ILIKE :search OR inventory.productId ILIKE :search OR inventory.variantId ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const items = await qb.orderBy('inventory.updatedAt', 'DESC').getMany();
    return {
      items: items.map((item) => this.toInventoryRecord(item)),
      total: items.length,
    };
  }

  async createSellerInventory(
    sellerId: string,
    dto: CreateInventoryItemDto,
  ): Promise<any> {
    const shop = await this.getShopBySellerId(sellerId);
    if (!shop) {
      throw new NotFoundException('You do not have a shop. Please create a shop first.');
    }
    if (shop.status === 'rejected' || shop.status === 'suspended') {
      throw new BadRequestException(`Your shop is ${shop.status}. You cannot manage inventory.`);
    }

    const variantData = await this.validateProductVariant(dto.productId, dto.variantId);
    if (!variantData) {
      throw new NotFoundException('Product or variant not found, or variant is inactive.');
    }

    if (variantData.shopId && variantData.shopId !== shop.id) {
      throw new BadRequestException('This product does not belong to your shop.');
    }

    const existing = await this.inventoryRepository.findOne({
      where: { variantId: dto.variantId, shopId: shop.id },
    });

    if (existing) {
      existing.stock = dto.stock;
      existing.lowStockThreshold = dto.lowStockThreshold ?? existing.lowStockThreshold;
      return this.toInventoryRecord(await this.inventoryRepository.save(existing));
    }

    return this.toInventoryRecord(await this.inventoryRepository.save(
      this.inventoryRepository.create({
        productId: dto.productId,
        variantId: dto.variantId,
        shopId: shop.id,
        sku: variantData.sku,
        stock: dto.stock,
        reservedStock: 0,
        lowStockThreshold: dto.lowStockThreshold ?? 10,
      }),
    ));
  }

  async updateSellerInventoryByVariant(
    sellerId: string,
    variantId: string,
    dto: UpdateInventoryStockDto,
  ): Promise<any> {
    const shop = await this.getShopBySellerId(sellerId);
    if (!shop) {
      throw new NotFoundException('You do not have a shop.');
    }

    const item = await this.inventoryRepository.findOne({
      where: { variantId, shopId: shop.id },
    });
    if (!item) {
      throw new NotFoundException(`Inventory item for variant "${variantId}" not found in your shop.`);
    }

    if (dto.stock < item.reservedStock) {
      throw new BadRequestException(
        `Stock (${dto.stock}) cannot be less than reserved stock (${item.reservedStock}).`,
      );
    }

    item.stock = dto.stock;
    if (dto.lowStockThreshold !== undefined) {
      item.lowStockThreshold = dto.lowStockThreshold;
    }

    const saved = await this.inventoryRepository.save(item);
    return this.toInventoryRecord(saved);
  }

  // ─── RabbitMQ handlers ────────────────────────────────────────────────────────

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

  // ─── Internal Reserve/Release/Commit ────────────────────────────────────────

  async reserveInventoryItems(items: Array<{ shopId: string; variantId: string; quantity: number }>): Promise<{ success: boolean; failedItems?: Array<{ variantId: string; reason: string }> }> {
    const failedItems: Array<{ variantId: string; reason: string }> = [];

    for (const item of items) {
      const where: any = { variantId: item.variantId };
      if (item.shopId) {
        where.shopId = item.shopId;
      }

      const inventoryItem = await this.inventoryRepository.findOne({ where });
      if (!inventoryItem) {
        failedItems.push({ variantId: item.variantId, reason: 'inventory_not_found' });
        continue;
      }

      const available = inventoryItem.stock - inventoryItem.reservedStock;
      if (available < item.quantity) {
        failedItems.push({ variantId: item.variantId, reason: 'insufficient_stock' });
      }
    }

    if (failedItems.length > 0) {
      return { success: false, failedItems };
    }

    for (const item of items) {
      const where: any = { variantId: item.variantId };
      if (item.shopId) {
        where.shopId = item.shopId;
      }
      const inventoryItem = await this.inventoryRepository.findOne({ where });
      if (inventoryItem) {
        inventoryItem.reservedStock += item.quantity;
        await this.inventoryRepository.save(inventoryItem);
      }
    }

    return { success: true };
  }

  async releaseInventoryItems(items: Array<{ shopId: string; variantId: string; quantity: number }>): Promise<{ success: boolean }> {
    for (const item of items) {
      const where: any = { variantId: item.variantId };
      if (item.shopId) {
        where.shopId = item.shopId;
      }
      const inventoryItem = await this.inventoryRepository.findOne({ where });
      if (inventoryItem) {
        inventoryItem.reservedStock = Math.max(0, inventoryItem.reservedStock - item.quantity);
        await this.inventoryRepository.save(inventoryItem);
      }
    }
    return { success: true };
  }

  async commitInventoryItems(items: Array<{ shopId: string; variantId: string; quantity: number }>): Promise<{ success: boolean }> {
    for (const item of items) {
      const where: any = { variantId: item.variantId };
      if (item.shopId) {
        where.shopId = item.shopId;
      }
      const inventoryItem = await this.inventoryRepository.findOne({ where });
      if (inventoryItem) {
        inventoryItem.stock = Math.max(0, inventoryItem.stock - item.quantity);
        inventoryItem.reservedStock = Math.max(0, inventoryItem.reservedStock - item.quantity);
        await this.inventoryRepository.save(inventoryItem);
      }
    }
    return { success: true };
  }

  // ─── Private helpers ──────────────────────────────────────────────────────────

  private getHoldKey(orderId: string, variantId: string): string {
    return `inventory:hold:${orderId}:${variantId}`;
  }

  private getHoldTtl(): number {
    const value = Number(this.configService.get<string>('INVENTORY_HOLD_TTL_SECONDS') ?? 600);
    return Number.isFinite(value) && value > 0 ? value : 600;
  }

  private async validateProductVariant(productId: string, variantId: string): Promise<ProductVariantInternal | null> {
    const productServiceUrl = this.configService.get<string>('PRODUCT_SERVICE_URL');
    if (!productServiceUrl) {
      return null;
    }

    try {
      const res = await axios.get(
        `${productServiceUrl}/api/v1/internal/products/${productId}/variants/${variantId}`,
        { timeout: 5000 },
      );
      return res.data as ProductVariantInternal;
    } catch {
      return null;
    }
  }

  private async getShopBySellerId(sellerId: string): Promise<ShopInternal | null> {
    const storeServiceUrl = this.configService.get<string>('STORE_SERVICE_URL');
    if (!storeServiceUrl) {
      return null;
    }

    try {
      const res = await axios.get(
        `${storeServiceUrl}/api/v1/internal/shops/by-seller/${sellerId}`,
        { timeout: 5000 },
      );
      return res.data as ShopInternal;
    } catch {
      return null;
    }
  }

  private toInventoryRecord(item: InventoryItemEntity): any {
    const available = Math.max(0, item.stock - item.reservedStock);
    let status = 'in-stock';
    if (available === 0) {
      status = 'out-of-stock';
    } else if (available <= item.lowStockThreshold) {
      status = 'low-stock';
    }

    return {
      id: item.id,
      shopId: item.shopId,
      productId: item.productId,
      variantId: item.variantId,
      sku: item.sku,
      stock: item.stock,
      reservedStock: item.reservedStock,
      availableStock: available,
      lowStockThreshold: item.lowStockThreshold,
      status,
      updatedAt: item.updatedAt,
    };
  }
}
