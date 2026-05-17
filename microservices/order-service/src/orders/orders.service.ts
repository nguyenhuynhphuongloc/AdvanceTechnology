import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { DataSource, Repository } from 'typeorm';
import { Order, PaymentMethodType, ShippingAddressSnapshot } from './entities/order.entity';
import { ShopOrder, ShopOrderStatus } from './entities/shop-order.entity';
import { ShopOrderItem } from './entities/shop-order-item.entity';
import { CheckoutDto } from './dto/checkout.dto';
import { OrderQueryDto, AdminOrderQueryDto, SellerOrderQueryDto, AdminShopOrderQueryDto } from './dto/order-query.dto';
import { ShipOrderDto, CancelOrderDto, AdminUpdateShopOrderStatusDto } from './dto/seller-order.dto';

type CartItemSnapshot = {
  itemId: string;
  variantId: string;
  productId: string;
  shopId: string;
  productNameSnapshot: string;
  variantNameSnapshot: string;
  skuSnapshot: string;
  imageUrlSnapshot: string;
  shopNameSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  addedAt: string;
};

type CartGroup = {
  shopId: string;
  shopName: string;
  items: CartItemSnapshot[];
  shopSubtotal: number;
};

type CartResponse = {
  id: string;
  userId: string | null;
  groups: CartGroup[];
  subtotal: number;
  totalItems: number;
};

type ProductVariantInternal = {
  productId: string;
  variantId: string;
  shopId: string;
  sellerId: string;
  productName: string;
  variantName: string;
  sku: string;
  imageUrl: string;
  unitPrice: number;
  approvalStatus: string;
  isActive: boolean;
};

type InventoryCheckItem = {
  shopId: string;
  variantId: string;
  quantity: number;
};

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private readonly cartServiceUrl: string;
  private readonly inventoryServiceUrl: string;
  private readonly paymentServiceUrl: string;
  private readonly storeServiceUrl: string;
  private readonly productServiceUrl: string;

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(ShopOrder)
    private readonly shopOrderRepository: Repository<ShopOrder>,
    @InjectRepository(ShopOrderItem)
    private readonly shopOrderItemRepository: Repository<ShopOrderItem>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.cartServiceUrl = this.configService.get<string>('CART_SERVICE_URL') ?? 'http://localhost:3002';
    this.inventoryServiceUrl = this.configService.get<string>('INVENTORY_SERVICE_URL') ?? 'http://localhost:3005';
    this.paymentServiceUrl = this.configService.get<string>('PAYMENT_SERVICE_URL') ?? 'http://localhost:3006';
    this.storeServiceUrl = this.configService.get<string>('STORE_SERVICE_URL') ?? 'http://localhost:3001';
    this.productServiceUrl = this.configService.get<string>('PRODUCT_SERVICE_URL') ?? 'http://localhost:3003';
  }

  // ─── Checkout ────────────────────────────────────────────────────────────────

  async checkout(buyerId: string, dto: CheckoutDto) {
    const cart = await this.fetchCart(buyerId);

    if (!cart.groups.length || cart.totalItems === 0) {
      throw new BadRequestException('Cart is empty. Add items before checkout.');
    }

    for (const group of cart.groups) {
      if (!group.shopId || group.shopId === '__legacy__') {
        throw new BadRequestException(`Legacy cart items cannot be checked out. Please remove them and re-add.`);
      }
    }

    const allItems = cart.groups.flatMap((g) => g.items);

    await this.validateCartItems(allItems);

    const reserveItems: InventoryCheckItem[] = allItems.map((item) => ({
      shopId: item.shopId,
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    const stockReserved = await this.reserveStock(reserveItems);
    if (!stockReserved) {
      throw new BadRequestException('Insufficient stock for one or more items. Please adjust your cart.');
    }

    const orderNumber = this.generateOrderNumber();

    try {
      const savedOrder = await this.dataSource.transaction(async (manager) => {
        const orderRepo = manager.getRepository(Order);
        const shopOrderRepo = manager.getRepository(ShopOrder);
        const shopOrderItemRepo = manager.getRepository(ShopOrderItem);

        const orderToSave = manager.create(Order, {
          authUserId: buyerId,
          orderNumber,
          status: 'pending',
          paymentStatus: 'pending',
          paymentMethod: (dto.paymentMethod ?? 'cod') as PaymentMethodType,
          shippingAddressSnapshot: dto.shippingAddress,
          subtotal: cart.subtotal.toFixed(2),
          shippingFee: '0.00',
          totalAmount: cart.subtotal.toFixed(2),
          currency: 'VND',
          note: dto.note ?? null,
        });
        const savedOrder = (await orderRepo.save(orderToSave)) as Order;

        for (const group of cart.groups) {
          const shopInfo = await this.getShopInfo(group.shopId);

          const shopOrder = manager.create(ShopOrder, {
            orderId: savedOrder.id,
            shopId: group.shopId,
            sellerId: shopInfo?.sellerId ?? '',
            status: 'pending',
            subtotal: group.shopSubtotal.toFixed(2),
            shippingFee: '0.00',
            shopTotal: group.shopSubtotal.toFixed(2),
          });

          const savedShopOrder = (await shopOrderRepo.save(shopOrder)) as ShopOrder;

          for (const item of group.items) {
            const shopOrderItem = manager.create(ShopOrderItem, {
              shopOrderId: savedShopOrder.id,
              productId: item.productId,
              variantId: item.variantId,
              productNameSnapshot: item.productNameSnapshot,
              variantNameSnapshot: item.variantNameSnapshot,
              skuSnapshot: item.skuSnapshot,
              imageUrlSnapshot: item.imageUrlSnapshot,
              shopNameSnapshot: item.shopNameSnapshot,
              unitPrice: item.unitPriceSnapshot.toFixed(2),
              quantity: item.quantity,
              lineTotal: (item.unitPriceSnapshot * item.quantity).toFixed(2),
            });
            await shopOrderItemRepo.save(shopOrderItem);
          }
        }

        return savedOrder;
      });

      if (dto.paymentMethod === 'cod') {
        await this.createCodPayment(savedOrder.id, Number(savedOrder.totalAmount));
      }

      await this.clearCart(buyerId);

      return this.toCheckoutResponse(savedOrder.id);
    } catch (err) {
      await this.releaseStock(reserveItems);
      throw err;
    }
  }

  // ─── Buyer Order APIs ───────────────────────────────────────────────────────

  async listMyOrders(buyerId: string, query: OrderQueryDto) {
    const page = Math.max(1, parseInt(query.page ?? '1'));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20')));
    const skip = (page - 1) * limit;

    const where: any = { authUserId: buyerId };
    if (query.status) where.status = query.status;

    const [orders, total] = await Promise.all([
      this.orderRepository.find({
        where,
        relations: ['shopOrders', 'shopOrders.items'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      }),
      this.orderRepository.count({ where }),
    ]);

    return {
      items: orders.map((o) => this.toOrderResponse(o)),
      total,
      page,
      limit,
    };
  }

  async getMyOrder(buyerId: string, orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['shopOrders', 'shopOrders.items'],
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    if (order.authUserId !== buyerId) {
      throw new ForbiddenException('You do not own this order.');
    }

    return this.toOrderResponse(order);
  }

  async cancelMyOrder(buyerId: string, orderId: string, dto: CancelOrderDto) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['shopOrders', 'shopOrders.items'],
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    if (order.authUserId !== buyerId) {
      throw new ForbiddenException('You do not own this order.');
    }

    const cancellableStatuses = ['pending', 'awaiting_payment', 'processing'];
    if (!cancellableStatuses.includes(order.status)) {
      throw new BadRequestException(`Order cannot be cancelled in status: ${order.status}`);
    }

    const hasShipped = order.shopOrders.some((so) =>
      ['shipped', 'delivered', 'cancelled', 'refunded'].includes(so.status),
    );
    if (hasShipped) {
      throw new BadRequestException('Cannot cancel: some items have already been shipped.');
    }

    const releaseItems: InventoryCheckItem[] = order.shopOrders.flatMap((so) =>
      so.items.map((item) => ({
        shopId: so.shopId,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    );

    await this.releaseStock(releaseItems);

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = dto.reason ?? null;

    for (const shopOrder of order.shopOrders) {
      if (!['shipped', 'delivered', 'cancelled', 'refunded'].includes(shopOrder.status)) {
        shopOrder.status = 'cancelled';
        shopOrder.cancelledAt = new Date();
        shopOrder.cancelReason = dto.reason ?? null;
      }
    }

    await this.orderRepository.save(order);

    return this.toOrderResponse(order);
  }

  // ─── Seller Order APIs ──────────────────────────────────────────────────────

  async listSellerShopOrders(sellerId: string, query: SellerOrderQueryDto) {
    const shop = await this.getShopBySellerId(sellerId);
    if (!shop) {
      return { items: [], total: 0, page: 1, limit: 20 };
    }

    const page = Math.max(1, parseInt(query.page ?? '1'));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20')));
    const skip = (page - 1) * limit;

    const shopWhere: any = { shopId: shop.id };
    if (query.status) shopWhere.status = query.status as any;

    const [shopOrders, total] = await Promise.all([
      this.shopOrderRepository.find({
        where: shopWhere,
        relations: ['items'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      }),
      this.shopOrderRepository.count({ where: shopWhere }),
    ]);

    return {
      items: shopOrders.map((so) => this.toShopOrderResponse(so)),
      total,
      page,
      limit,
    };
  }

  async getSellerShopOrder(sellerId: string, shopOrderId: string) {
    const shop = await this.getShopBySellerId(sellerId);
    if (!shop) {
      throw new NotFoundException('Shop not found.');
    }

    const shopOrder = await this.shopOrderRepository.findOne({
      where: { id: shopOrderId },
      relations: ['items'],
    });

    if (!shopOrder) {
      throw new NotFoundException('ShopOrder not found.');
    }

    if (shopOrder.shopId !== shop.id) {
      throw new ForbiddenException('This ShopOrder does not belong to your shop.');
    }

    return this.toShopOrderResponse(shopOrder);
  }

  async confirmSellerShopOrder(sellerId: string, shopOrderId: string) {
    const shop = await this.getShopBySellerId(sellerId);
    if (!shop) throw new NotFoundException('Shop not found.');

    const shopOrder = await this.shopOrderRepository.findOne({ where: { id: shopOrderId } });
    if (!shopOrder) throw new NotFoundException('ShopOrder not found.');
    if (shopOrder.shopId !== shop.id) throw new ForbiddenException('Not your shop order.');

    if (shopOrder.status !== 'pending') {
      throw new BadRequestException(`Cannot confirm shop order in status: ${shopOrder.status}`);
    }

    shopOrder.status = 'confirmed';
    shopOrder.confirmedAt = new Date();
    await this.shopOrderRepository.save(shopOrder);

    await this.syncOrderStatus(shopOrder.orderId);

    return this.toShopOrderResponse(shopOrder);
  }

  async shipSellerShopOrder(sellerId: string, shopOrderId: string, dto: ShipOrderDto) {
    const shop = await this.getShopBySellerId(sellerId);
    if (!shop) throw new NotFoundException('Shop not found.');

    const shopOrder = await this.shopOrderRepository.findOne({
      where: { id: shopOrderId },
      relations: ['items'],
    });
    if (!shopOrder) throw new NotFoundException('ShopOrder not found.');
    if (shopOrder.shopId !== shop.id) throw new ForbiddenException('Not your shop order.');

    const shippableStatuses = ['confirmed', 'processing'];
    if (!shippableStatuses.includes(shopOrder.status)) {
      throw new BadRequestException(`Cannot ship shop order in status: ${shopOrder.status}`);
    }

    shopOrder.status = 'shipped';
    shopOrder.shippedAt = new Date();
    shopOrder.trackingNumber = dto.trackingNumber ?? null;
    shopOrder.shippingProvider = dto.shippingProvider ?? null;
    await this.shopOrderRepository.save(shopOrder);

    await this.syncOrderStatus(shopOrder.orderId);

    return this.toShopOrderResponse(shopOrder);
  }

  async deliverSellerShopOrder(sellerId: string, shopOrderId: string) {
    const shop = await this.getShopBySellerId(sellerId);
    if (!shop) throw new NotFoundException('Shop not found.');

    const shopOrder = await this.shopOrderRepository.findOne({
      where: { id: shopOrderId },
      relations: ['items'],
    });
    if (!shopOrder) throw new NotFoundException('ShopOrder not found.');
    if (shopOrder.shopId !== shop.id) throw new ForbiddenException('Not your shop order.');

    if (shopOrder.status !== 'shipped') {
      throw new BadRequestException(`Cannot deliver shop order in status: ${shopOrder.status}`);
    }

    const commitItems: InventoryCheckItem[] = shopOrder.items.map((item) => ({
      shopId: shopOrder.shopId,
      variantId: item.variantId,
      quantity: item.quantity,
    }));
    await this.commitStock(commitItems);

    shopOrder.status = 'delivered';
    shopOrder.deliveredAt = new Date();
    await this.shopOrderRepository.save(shopOrder);

    await this.syncOrderStatus(shopOrder.orderId);

    return this.toShopOrderResponse(shopOrder);
  }

  async cancelSellerShopOrder(sellerId: string, shopOrderId: string, dto: CancelOrderDto) {
    const shop = await this.getShopBySellerId(sellerId);
    if (!shop) throw new NotFoundException('Shop not found.');

    const shopOrder = await this.shopOrderRepository.findOne({
      where: { id: shopOrderId },
      relations: ['items'],
    });
    if (!shopOrder) throw new NotFoundException('ShopOrder not found.');
    if (shopOrder.shopId !== shop.id) throw new ForbiddenException('Not your shop order.');

    const cancellableStatuses = ['pending', 'confirmed', 'processing'];
    if (!cancellableStatuses.includes(shopOrder.status)) {
      throw new BadRequestException(`Cannot cancel shop order in status: ${shopOrder.status}`);
    }

    const releaseItems: InventoryCheckItem[] = shopOrder.items.map((item) => ({
      shopId: shopOrder.shopId,
      variantId: item.variantId,
      quantity: item.quantity,
    }));
    await this.releaseStock(releaseItems);

    shopOrder.status = 'cancelled';
    shopOrder.cancelledAt = new Date();
    shopOrder.cancelReason = dto.reason ?? null;
    await this.shopOrderRepository.save(shopOrder);

    await this.syncOrderStatus(shopOrder.orderId);

    return this.toShopOrderResponse(shopOrder);
  }

  // ─── Admin Order APIs ───────────────────────────────────────────────────────

  async listAdminOrders(query: AdminOrderQueryDto) {
    const page = Math.max(1, parseInt(query.page ?? '1'));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20')));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.buyerId) where.authUserId = query.buyerId;
    if (query.paymentStatus) where.paymentStatus = query.paymentStatus;

    const [orders, total] = await Promise.all([
      this.orderRepository.find({
        where,
        relations: ['shopOrders', 'shopOrders.items'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      }),
      this.orderRepository.count({ where }),
    ]);

    return { items: orders.map((o) => this.toOrderResponse(o)), total, page, limit };
  }

  async getAdminOrder(orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['shopOrders', 'shopOrders.items'],
    });
    if (!order) throw new NotFoundException('Order not found.');
    return this.toOrderResponse(order);
  }

  async listAdminShopOrders(query: AdminShopOrderQueryDto) {
    const page = Math.max(1, parseInt(query.page ?? '1'));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20')));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status as any;
    if (query.shopId) where.shopId = query.shopId;
    if (query.sellerId) where.sellerId = query.sellerId;
    if (query.orderId) where.orderId = query.orderId;

    const [shopOrders, total] = await Promise.all([
      this.shopOrderRepository.find({
        where,
        relations: ['items'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      }),
      this.shopOrderRepository.count({ where }),
    ]);

    return { items: shopOrders.map((so) => this.toShopOrderResponse(so)), total, page, limit };
  }

  async getAdminShopOrder(shopOrderId: string) {
    const shopOrder = await this.shopOrderRepository.findOne({
      where: { id: shopOrderId },
      relations: ['items'],
    });
    if (!shopOrder) throw new NotFoundException('ShopOrder not found.');
    return this.toShopOrderResponse(shopOrder);
  }

  async updateAdminShopOrderStatus(shopOrderId: string, dto: AdminUpdateShopOrderStatusDto) {
    const shopOrder = await this.shopOrderRepository.findOne({
      where: { id: shopOrderId },
      relations: ['items'],
    });
    if (!shopOrder) throw new NotFoundException('ShopOrder not found.');

    const prevStatus = shopOrder.status;
    shopOrder.status = dto.status as ShopOrderStatus;

    if (dto.status === 'confirmed' && prevStatus === 'pending') {
      shopOrder.confirmedAt = new Date();
    } else if (dto.status === 'shipped' && prevStatus !== 'shipped') {
      shopOrder.shippedAt = new Date();
    } else if (dto.status === 'delivered' && prevStatus !== 'delivered') {
      const commitItems: InventoryCheckItem[] = shopOrder.items.map((item) => ({
        shopId: shopOrder.shopId,
        variantId: item.variantId,
        quantity: item.quantity,
      }));
      await this.commitStock(commitItems);
      shopOrder.deliveredAt = new Date();
    } else if (dto.status === 'cancelled' && !['shipped', 'delivered', 'cancelled', 'refunded'].includes(prevStatus)) {
      shopOrder.cancelledAt = new Date();
      shopOrder.cancelReason = dto.reason ?? null;
      const releaseItems: InventoryCheckItem[] = shopOrder.items.map((item) => ({
        shopId: shopOrder.shopId,
        variantId: item.variantId,
        quantity: item.quantity,
      }));
      await this.releaseStock(releaseItems);
    }

    await this.shopOrderRepository.save(shopOrder);
    await this.syncOrderStatus(shopOrder.orderId);

    return this.toShopOrderResponse(shopOrder);
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private async fetchCart(buyerId: string): Promise<CartResponse> {
    try {
      const res = await axios.get(`${this.cartServiceUrl}/api/v1/carts/me`, {
        headers: { 'x-user-id': buyerId },
        timeout: 8000,
      });
      return res.data as CartResponse;
    } catch (err: any) {
      if (err.response?.status === 404) {
        return { id: '', userId: buyerId, groups: [], subtotal: 0, totalItems: 0 };
      }
      throw new BadRequestException('Failed to fetch cart. Please try again.');
    }
  }

  private async clearCart(buyerId: string) {
    try {
      await axios.delete(`${this.cartServiceUrl}/api/v1/carts/me`, {
        headers: { 'x-user-id': buyerId },
        timeout: 5000,
      });
    } catch {
      this.logger.warn(`Failed to clear cart for buyer ${buyerId}. Cart may need manual cleanup.`);
    }
  }

  private async validateCartItems(items: CartItemSnapshot[]) {
    for (const item of items) {
      if (!item.shopId || item.shopId === '__legacy__') {
        throw new BadRequestException(`Item "${item.productNameSnapshot}" has no shop assigned. Cannot checkout.`);
      }
      try {
        const res = await axios.get(
          `${this.productServiceUrl}/api/v1/internal/products/${item.productId}/variants/${item.variantId}`,
          { timeout: 5000 },
        );
        const variant: ProductVariantInternal = res.data;
        if (!variant.isActive || variant.approvalStatus !== 'approved') {
          throw new BadRequestException(
            `Product "${item.productNameSnapshot}" is not available. Status: ${variant.approvalStatus}`,
          );
        }
      } catch {
        throw new BadRequestException(`Product "${item.productNameSnapshot}" not found or variant invalid.`);
      }
    }
  }

  private async reserveStock(items: InventoryCheckItem[]): Promise<boolean> {
    try {
      const res = await axios.post(
        `${this.inventoryServiceUrl}/api/v1/internal/inventory/reserve`,
        { items },
        { timeout: 8000 },
      );
      return res.status === 200 || res.status === 201;
    } catch (err: any) {
      this.logger.warn(`Reserve stock failed: ${err.message}`);
      return false;
    }
  }

  private async releaseStock(items: InventoryCheckItem[]): Promise<void> {
    try {
      await axios.post(
        `${this.inventoryServiceUrl}/api/v1/internal/inventory/release`,
        { items },
        { timeout: 8000 },
      );
    } catch (err: any) {
      this.logger.warn(`Release stock failed: ${err.message}`);
    }
  }

  private async commitStock(items: InventoryCheckItem[]): Promise<void> {
    try {
      await axios.post(
        `${this.inventoryServiceUrl}/api/v1/internal/inventory/commit`,
        { items },
        { timeout: 8000 },
      );
    } catch (err: any) {
      this.logger.warn(`Commit stock failed: ${err.message}`);
    }
  }

  private async createCodPayment(orderId: string, amount: number) {
    try {
      await axios.post(
        `${this.paymentServiceUrl}/api/v1/payments/transactions`,
        {
          orderId,
          method: 'cod',
          amount,
          status: 'pending',
        },
        { timeout: 5000 },
      );
    } catch (err: any) {
      this.logger.warn(`Failed to create COD payment for order ${orderId}: ${err.message}`);
    }
  }

  private async getShopInfo(shopId: string): Promise<{ id: string; sellerId: string; name: string } | null> {
    try {
      const res = await axios.get(`${this.storeServiceUrl}/api/v1/internal/shops/${shopId}`, { timeout: 5000 });
      return res.data;
    } catch {
      return null;
    }
  }

  private async getShopBySellerId(sellerId: string): Promise<{ id: string; sellerId: string; name: string } | null> {
    try {
      const res = await axios.get(`${this.storeServiceUrl}/api/v1/internal/shops/by-seller/${sellerId}`, {
        timeout: 5000,
      });
      return res.data;
    } catch {
      return null;
    }
  }

  private async syncOrderStatus(orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['shopOrders'],
    });
    if (!order) return;

    const shopOrders = order.shopOrders ?? [];
    const allCancelled = shopOrders.every((so) => ['cancelled', 'refunded'].includes(so.status));
    const allShipped = shopOrders.every((so) => ['shipped', 'delivered', 'cancelled', 'refunded'].includes(so.status));
    const allDelivered = shopOrders.every((so) => ['delivered', 'refunded'].includes(so.status));
    const anyShipped = shopOrders.some((so) => ['shipped', 'delivered'].includes(so.status));

    if (allCancelled) {
      order.status = 'cancelled';
    } else if (allDelivered) {
      order.status = 'delivered';
    } else if (allShipped && anyShipped) {
      order.status = 'shipped';
    } else if (anyShipped) {
      order.status = 'partially_shipped';
    }

    await this.orderRepository.save(order);
  }

  private async toCheckoutResponse(orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['shopOrders', 'shopOrders.items'],
    });
    if (!order) throw new NotFoundException('Order not found after creation.');
    return this.toOrderResponse(order);
  }

  private toOrderResponse(order: Order) {
    const shopOrders = (order.shopOrders ?? []).map((so) => this.toShopOrderResponse(so));
    const totalAmount = Number(order.totalAmount ?? 0);
    const subtotal = Number(order.subtotal ?? 0);
    const shippingFee = Number(order.shippingFee ?? 0);

    return {
      id: order.id,
      buyerId: order.authUserId,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      shippingAddressSnapshot: order.shippingAddressSnapshot,
      subtotal,
      shippingFee,
      totalAmount,
      currency: order.currency,
      note: order.note,
      cancelledAt: order.cancelledAt,
      cancelReason: order.cancelReason,
      shopOrders,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  private toShopOrderResponse(shopOrder: ShopOrder) {
    return {
      id: shopOrder.id,
      orderId: shopOrder.orderId,
      shopId: shopOrder.shopId,
      sellerId: shopOrder.sellerId,
      status: shopOrder.status,
      subtotal: Number(shopOrder.subtotal ?? 0),
      shippingFee: Number(shopOrder.shippingFee ?? 0),
      shopTotal: Number(shopOrder.shopTotal ?? 0),
      trackingNumber: shopOrder.trackingNumber,
      shippingProvider: shopOrder.shippingProvider,
      estimatedDelivery: shopOrder.estimatedDelivery,
      confirmedAt: shopOrder.confirmedAt,
      shippedAt: shopOrder.shippedAt,
      deliveredAt: shopOrder.deliveredAt,
      cancelledAt: shopOrder.cancelledAt,
      cancelReason: shopOrder.cancelReason,
      items: (shopOrder.items ?? []).map((item) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        productNameSnapshot: item.productNameSnapshot,
        variantNameSnapshot: item.variantNameSnapshot,
        skuSnapshot: item.skuSnapshot,
        imageUrlSnapshot: item.imageUrlSnapshot,
        shopNameSnapshot: item.shopNameSnapshot,
        unitPrice: Number(item.unitPrice),
        quantity: item.quantity,
        lineTotal: Number(item.lineTotal),
      })),
      createdAt: shopOrder.createdAt,
      updatedAt: shopOrder.updatedAt,
    };
  }

  private generateOrderNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${dateStr}-${rand}`;
  }
}
