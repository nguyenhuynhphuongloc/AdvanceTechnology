import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { CartItemDto } from './dto/cart-item.dto';
import { MergeCartDto } from './dto/merge-cart.dto';
import { CartItemSnapshot, CartState } from './entities/cart-state.entity';

type CartOwner = { userId: string | null; guestToken: string | null; ownerKey: string };

@Injectable()
export class CartService {
  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    @InjectRepository(CartState)
    private readonly cartRepository: Repository<CartState>,
  ) {}

  async getCart(owner: CartOwner) {
    const cached = await this.redisService.getJson<CartState>(owner.ownerKey);
    if (cached) {
      return cached;
    }

    const cart = await this.loadOrCreate(owner);
    await this.cacheCart(cart);
    return cart;
  }

  async addItem(owner: CartOwner, item: CartItemDto) {
    if (!item.variantId || item.quantity <= 0 || item.unitPrice < 0) {
      throw new BadRequestException('variantId, quantity, and unitPrice are required.');
    }

    const cart = await this.loadOrCreate(owner);
    const existing = cart.items.find((entry) => entry.variantId === item.variantId);
    if (existing) {
      existing.quantity += item.quantity;
      existing.unitPrice = item.unitPrice;
    } else {
      cart.items.push({
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      });
    }

    const saved = await this.cartRepository.save(cart);
    await this.cacheCart(saved);
    return saved;
  }

  async removeItem(owner: CartOwner, variantId: string) {
    const cart = await this.loadOrCreate(owner);
    cart.items = cart.items.filter((item) => item.variantId !== variantId);
    const saved = await this.cartRepository.save(cart);
    await this.cacheCart(saved);
    return saved;
  }

  async clearCart(owner: CartOwner) {
    const cart = await this.loadOrCreate(owner);
    cart.items = [];
    const saved = await this.cartRepository.save(cart);
    await this.redisService.delete(owner.ownerKey);
    return saved;
  }

  async mergeIntoUserCart(userId: string, dto: MergeCartDto) {
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

    for (const item of guestCart.items) {
      const existing = userCart.items.find((entry) => entry.variantId === item.variantId);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        userCart.items.push(item);
      }
    }

    const saved = await this.cartRepository.save(userCart);
    await this.cartRepository.delete({ ownerKey: guestOwner.ownerKey });
    await this.cacheCart(saved);
    await this.redisService.delete(guestOwner.ownerKey);
    return saved;
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

  private buildUserOwner(userId: string): CartOwner {
    return { userId, guestToken: null, ownerKey: `cart:user:${userId}` };
  }

  private buildGuestOwner(guestToken: string): CartOwner {
    return { userId: null, guestToken, ownerKey: `cart:guest:${guestToken}` };
  }

  private async loadOrCreate(owner: CartOwner) {
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

  private getCartTtl() {
    const value = Number(this.configService.get<string>('CART_TTL_SECONDS') ?? 1800);
    return Number.isFinite(value) && value > 0 ? value : 1800;
  }
}
