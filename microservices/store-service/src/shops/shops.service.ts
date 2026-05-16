import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop, ShopStatus } from './entities/shop.entity';
import { CreateShopDto, UpdateShopDto, AdminUpdateShopDto } from './dto/shop.dto';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Shop)
    private readonly shopRepo: Repository<Shop>,
  ) {}

  async createShop(sellerId: string, dto: CreateShopDto) {
    const existing = await this.shopRepo.findOne({ where: { sellerId } });
    if (existing) {
      throw new ConflictException('Seller already has a shop.');
    }

    const slugExists = await this.shopRepo.findOne({ where: { slug: dto.slug } });
    if (slugExists) {
      throw new ConflictException('Shop slug already exists.');
    }

    const shop = this.shopRepo.create({
      sellerId,
      ...dto,
      status: ShopStatus.PENDING,
    });

    return this.shopRepo.save(shop);
  }

  async getShopBySeller(sellerId: string) {
    const shop = await this.shopRepo.findOne({ where: { sellerId } });
    if (!shop) {
      throw new NotFoundException('Shop not found for this seller.');
    }
    return shop;
  }

  async updateShop(sellerId: string, dto: UpdateShopDto) {
    const shop = await this.getShopBySeller(sellerId);
    Object.assign(shop, dto);
    return this.shopRepo.save(shop);
  }

  // ─── Public ────────────────────────────────────────────────────────────────

  async getApprovedShops(page = 1, limit = 20) {
    const [items, total] = await this.shopRepo.findAndCount({
      where: { status: ShopStatus.APPROVED },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit };
  }

  async getApprovedShopBySlug(slug: string) {
    const shop = await this.shopRepo.findOne({ where: { slug, status: ShopStatus.APPROVED } });
    if (!shop) {
      throw new NotFoundException('Shop not found.');
    }
    return shop;
  }

  // ─── Admin ─────────────────────────────────────────────────────────────────

  async listAllShops(page = 1, limit = 20, status?: ShopStatus) {
    const where = status ? { status } : {};
    const [items, total] = await this.shopRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit };
  }

  async getShopById(id: string) {
    const shop = await this.shopRepo.findOne({ where: { id } });
    if (!shop) {
      throw new NotFoundException(`Shop ${id} not found.`);
    }
    return shop;
  }

  async approveShop(id: string) {
    const shop = await this.getShopById(id);
    shop.status = ShopStatus.APPROVED;
    return this.shopRepo.save(shop);
  }

  async rejectShop(id: string, reason?: string) {
    const shop = await this.getShopById(id);
    shop.status = ShopStatus.REJECTED;
    shop.rejectionReason = reason ?? null;
    return this.shopRepo.save(shop);
  }

  async suspendShop(id: string) {
    const shop = await this.getShopById(id);
    shop.status = ShopStatus.SUSPENDED;
    return this.shopRepo.save(shop);
  }

  async restoreShop(id: string) {
    const shop = await this.getShopById(id);
    shop.status = ShopStatus.APPROVED;
    return this.shopRepo.save(shop);
  }

  async adminUpdateShop(id: string, dto: AdminUpdateShopDto) {
    const shop = await this.getShopById(id);
    Object.assign(shop, dto);
    return this.shopRepo.save(shop);
  }

  // ─── Internal (not exposed via gateway) ───────────────────────────────────────

  async getShopBySellerId(sellerId: string) {
    return this.shopRepo.findOne({ where: { sellerId } });
  }
}
