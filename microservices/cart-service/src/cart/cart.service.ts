import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { AdminCartQueryDto } from './dto/admin-cart-query.dto';
import { MergeCartDto } from './dto/merge-cart.dto';
import { CartItemSnapshot, CartState } from './entities/cart-state.entity';

type CartOwner = { userId: string | null; guestToken: string | null; ownerKey: string };

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

interface ShopGroup {
  shopId: string;
  shopName: string;
  items: CartItemSnapshot[];
  shopSubtotal: number;
}

interface GroupedCartResponse {
  id: string;
  userId: string | null;
  guestToken: string | null;
  groups: ShopGroup[];
  subtotal: number;
  totalItems: number;
  updatedAt: Date;
}

@Injectable()
export class CartService {
  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    @InjectRepository(CartState)
    private readonly cartRepository: Repository<CartState>,
  ) {}

  async getCart(owner: CartOwner): Promise<GroupedCartResponse> {
    const cached = await this.redisService.getJson<CartState>(owner.ownerKey);
    if (cached) {
      return this.toGroupedCartResponse(cached);
    }

    const cart = await this.loadOrCreate(owner);
    await this.cacheCart(cart);
    return this.toGroupedCartResponse(cart);
  }

  async addItem(owner: CartOwner, productId: string, variantId: string, quantity: number): Promise<CartState> {
    if (!productId || !variantId || !quantity || quantity <= 0) {
      throw new BadRequestException('productId, variantId, and quantity (> 0) are required.');
    }

    const variantData = await this.validateProductVariant(productId, variantId);

    if (!variantData) {
      throw new BadRequestException('Product or variant not found, or variant is inactive.');
    }

    if (!variantData.shopId) {
      throw new BadRequestException('Legacy product must be assigned to a shop before purchase.');
    }

    if (!variantData.isActive || variantData.approvalStatus !== 'approved') {
      throw new BadRequestException(
        `Product is not available for purchase. Status: ${variantData.approvalStatus}`,
      );
    }

    const cart = await this.loadOrCreate(owner);

    const existing = cart.items.find((entry) => entry.variantId === variantId);
    if (existing) {
      existing.quantity += quantity;
      existing.unitPriceSnapshot = variantData.unitPrice;
    } else {
      cart.items.push({
        itemId: this.generateItemId(),
        variantId,
        productId,
        shopId: variantData.shopId,
        productNameSnapshot: variantData.productName,
        variantNameSnapshot: variantData.variantName,
        skuSnapshot: variantData.sku,
        imageUrlSnapshot: variantData.imageUrl ?? '',
        shopNameSnapshot: '',
        unitPriceSnapshot: variantData.unitPrice,
        quantity,
        addedAt: new Date().toISOString(),
      });
    }

    const saved = await this.cartRepository.save(cart);
    await this.cacheCart(saved);
    return saved;
  }

  async updateItemQuantity(
    owner: CartOwner,
    itemId: string,
    quantity: number,
  ): Promise<CartState> {
    if (!itemId || !quantity || quantity <= 0) {
      throw new BadRequestException('itemId and quantity (> 0) are required.');
    }

    const cart = await this.loadOrCreate(owner);
    const item = cart.items.find((entry) => entry.itemId === itemId);
    if (!item) {
      throw new NotFoundException(`Cart item with id "${itemId}" was not found.`);
    }

    item.quantity = quantity;
    const saved = await this.cartRepository.save(cart);
    await this.cacheCart(saved);
    return saved;
  }

  async removeItem(owner: CartOwner, identifier: string, byItemId = false): Promise<CartState> {
    const cart = await this.loadOrCreate(owner);

    if (byItemId) {
      const idx = cart.items.findIndex((entry) => entry.itemId === identifier);
      if (idx === -1) {
        throw new NotFoundException(`Cart item with id "${identifier}" was not found.`);
      }
      cart.items.splice(idx, 1);
    } else {
      const idx = cart.items.findIndex((entry) => entry.variantId === identifier);
      if (idx === -1) {
        throw new NotFoundException(`Cart item with variantId "${identifier}" was not found.`);
      }
      cart.items.splice(idx, 1);
    }

    const saved = await this.cartRepository.save(cart);
    await this.cacheCart(saved);
    return saved;
  }

  async clearCart(owner: CartOwner): Promise<CartState> {
    const cart = await this.loadOrCreate(owner);
    cart.items = [];
    const saved = await this.cartRepository.save(cart);
    await this.redisService.delete(owner.ownerKey);
    return saved;
  }

  async mergeIntoUserCart(userId: string, dto: MergeCartDto): Promise<CartState> {
    if (!dto.guestToken) {
      throw new BadRequestException('guestToken is required.');
    }

    const userOwner = this.buildUserOwner(userId);
    const guestOwner = this.buildGuestOwner(dto.guestToken);
    const userCart = await this.loadOrCreate(userOwner);
    const guestCart = await this.cartRepository.findOne({ where: { ownerKey: guestOwner.ownerKey } });

    if (!guestCart) {
      return userCart;
    }

    for (const guestItem of guestCart.items) {
      const existing = userCart.items.find((entry) => entry.variantId === guestItem.variantId);
      if (existing) {
        existing.quantity += guestItem.quantity;
      } else {
        userCart.items.push({ ...guestItem, itemId: this.generateItemId() });
      }
    }

    const saved = await this.cartRepository.save(userCart);
    await this.cartRepository.delete({ ownerKey: guestOwner.ownerKey });
    await this.cacheCart(saved);
    await this.redisService.delete(guestOwner.ownerKey);
    return saved;
  }

  async searchCarts(query: AdminCartQueryDto) {
    const qb = this.cartRepository.createQueryBuilder('cart');

    if (query.userId) {
      qb.andWhere('cart.userId = :userId', { userId: query.userId });
    }

    if (query.guestToken) {
      qb.andWhere('cart.guestToken = :guestToken', { guestToken: query.guestToken });
    }

    if (query.search) {
      qb.andWhere(
        '(cart.userId ILIKE :search OR cart.guestToken ILIKE :search OR cart.ownerKey ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const items = await qb.orderBy('cart.updatedAt', 'DESC').getMany();
    return {
      items: items.map((cart) => this.toAdminCartRecord(cart)),
      total: items.length,
    };
  }

  async getCartById(id: string) {
    const cart = await this.cartRepository.findOne({ where: { id } });
    if (!cart) {
      throw new NotFoundException(`Cart with id "${id}" was not found.`);
    }

    return this.toAdminCartRecord(cart);
  }

  buildOwner(userId: string | undefined, guestToken: string | undefined): CartOwner {
    if (userId) {
      return this.buildUserOwner(userId);
    }

    if (guestToken) {
      return this.buildGuestOwner(guestToken);
    }

    throw new BadRequestException('Either X-User-Id or X-Guest-Token header is required.');
  }

  buildUserOwner(userId: string): CartOwner {
    return { userId, guestToken: null, ownerKey: `cart:user:${userId}` };
  }

  private buildGuestOwner(guestToken: string): CartOwner {
    return { userId: null, guestToken, ownerKey: `cart:guest:${guestToken}` };
  }

  private async loadOrCreate(owner: CartOwner): Promise<CartState> {
    const existing = await this.cartRepository.findOne({ where: { ownerKey: owner.ownerKey } });
    if (existing) {
      return existing;
    }

    return this.cartRepository.save(
      this.cartRepository.create({
        userId: owner.userId,
        guestToken: owner.guestToken,
        ownerKey: owner.ownerKey,
        items: [],
      }),
    );
  }

  private async cacheCart(cart: CartState) {
    await this.redisService.setJson(cart.ownerKey, cart, this.getCartTtl());
  }

  private getCartTtl(): number {
    const value = Number(this.configService.get<string>('CART_TTL_SECONDS') ?? 1800);
    return Number.isFinite(value) && value > 0 ? value : 1800;
  }

  private generateItemId(): string {
    return `ci_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private async validateProductVariant(
    productId: string,
    variantId: string,
  ): Promise<ProductVariantInternal | null> {
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

  private toGroupedCartResponse(cart: CartState): GroupedCartResponse {
    const shopMap = new Map<string, ShopGroup>();

    for (const item of cart.items) {
      const shopId = item.shopId || '__legacy__';
      const shopName = item.shopNameSnapshot || 'Unknown Shop';

      if (!shopMap.has(shopId)) {
        shopMap.set(shopId, {
          shopId,
          shopName,
          items: [],
          shopSubtotal: 0,
        });
      }

      const group = shopMap.get(shopId)!;
      group.items.push(item);
      group.shopSubtotal += item.quantity * item.unitPriceSnapshot;
    }

    const groups = Array.from(shopMap.values());
    const subtotal = groups.reduce((sum, g) => sum + g.shopSubtotal, 0);
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: cart.id,
      userId: cart.userId,
      guestToken: cart.guestToken,
      groups,
      subtotal,
      totalItems,
      updatedAt: cart.updatedAt,
    };
  }

  private toAdminCartRecord(cart: CartState) {
    return {
      ...cart,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: cart.items.reduce((sum, item) => sum + item.quantity * item.unitPriceSnapshot, 0),
    };
  }
}
