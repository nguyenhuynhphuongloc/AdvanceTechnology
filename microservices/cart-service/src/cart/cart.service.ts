import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartItem } from './entities/cart-item.entity';
import { Cart } from './entities/cart.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
  ) {}

  async getCart(userId: number) {
    const cart = await this.getOrCreateCart(userId);
    return this.toCartResponse(cart);
  }

  async addItem(userId: number, dto: AddCartItemDto) {
    if (dto.quantity <= 0) {
      throw new BadRequestException('quantity must be greater than 0');
    }

    if (dto.price < 0) {
      throw new BadRequestException('price must be 0 or greater');
    }

    const cart = await this.getOrCreateCart(userId);
    const existingItem = cart.items.find((item) => item.productId === dto.productId);

    if (existingItem) {
      existingItem.quantity += dto.quantity;
      existingItem.price = dto.price.toFixed(2);
      existingItem.name = dto.name;
      await this.cartItemRepository.save(existingItem);
    } else {
      const newItem = this.cartItemRepository.create({
        productId: dto.productId,
        name: dto.name,
        price: dto.price.toFixed(2),
        quantity: dto.quantity,
        cart,
      });
      await this.cartItemRepository.save(newItem);
    }

    return this.getCart(userId);
  }

  async updateItem(userId: number, itemId: number, dto: UpdateCartItemDto) {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items.find((entry) => entry.id === itemId);

    if (!item) {
      throw new NotFoundException('cart item not found');
    }

    if (dto.quantity <= 0) {
      await this.cartItemRepository.remove(item);
      return this.getCart(userId);
    }

    item.quantity = dto.quantity;
    await this.cartItemRepository.save(item);
    return this.getCart(userId);
  }

  async removeItem(userId: number, itemId: number) {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items.find((entry) => entry.id === itemId);

    if (!item) {
      throw new NotFoundException('cart item not found');
    }

    await this.cartItemRepository.remove(item);
    return this.getCart(userId);
  }

  async clearCart(userId: number) {
    const cart = await this.getOrCreateCart(userId);
    if (cart.items.length) {
      await this.cartItemRepository.remove(cart.items);
    }
    return this.getCart(userId);
  }

  private async getOrCreateCart(userId: number) {
    const existing = await this.cartRepository.findOne({
      where: { userId },
      relations: { items: true },
    });

    if (existing) {
      return existing;
    }

    const cart = this.cartRepository.create({ userId, items: [] });
    return this.cartRepository.save(cart);
  }

  private toCartResponse(cart: Cart) {
    const items = [...cart.items].map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.name,
      price: Number(item.price),
      quantity: item.quantity,
      lineTotal: Number(item.price) * item.quantity,
    }));

    const subtotal = items.reduce((total, item) => total + item.lineTotal, 0);

    return {
      id: cart.id,
      userId: cart.userId,
      items,
      subtotal,
      updatedAt: cart.updatedAt,
    };
  }
}
