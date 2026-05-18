import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { ShopCategory } from './entities/shop-category.entity';
import { CreateShopCategoryDto, UpdateShopCategoryDto } from './dto/shop-category.dto';

@Injectable()
export class ShopCategoriesService {
  constructor(
    @InjectRepository(ShopCategory)
    private readonly categoryRepo: Repository<ShopCategory>,
  ) {}

  private normalizeSlug(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async getCategoriesByShop(shopId: string): Promise<ShopCategory[]> {
    return this.categoryRepo.find({
      where: { shopId, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async createCategory(shopId: string, dto: CreateShopCategoryDto): Promise<ShopCategory> {
    const normalizedSlug = this.normalizeSlug(dto.slug);
    const normalizedName = dto.name.trim();

    if (!normalizedName || !normalizedSlug) {
      throw new BadRequestException('Category name and slug are required.');
    }

    const existing = await this.categoryRepo.findOne({
      where: [
        { shopId, slug: normalizedSlug },
        { shopId, name: normalizedName },
      ],
    });
    if (existing) {
      throw new ConflictException('A category with the same name or slug already exists in this shop.');
    }

    const category = this.categoryRepo.create({
      shopId,
      name: normalizedName,
      slug: normalizedSlug,
      description: dto.description ?? null,
      isActive: dto.isActive ?? true,
    });

    return this.categoryRepo.save(category);
  }

  async updateCategory(
    shopId: string,
    categoryId: string,
    dto: UpdateShopCategoryDto,
  ): Promise<ShopCategory> {
    const category = await this.categoryRepo.findOne({ where: { id: categoryId, shopId } as any });
    if (!category) {
      throw new NotFoundException(`Category "${categoryId}" not found in this shop.`);
    }

    if (dto.slug) {
      const normalizedSlug = this.normalizeSlug(dto.slug);
      const duplicate = await this.categoryRepo.findOne({
        where: { shopId, slug: normalizedSlug, id: Not(categoryId) },
      });
      if (duplicate) {
        throw new ConflictException('A category with the same slug already exists in this shop.');
      }
      category.slug = normalizedSlug;
    }

    if (dto.name) {
      category.name = dto.name.trim();
    }

    if (dto.description !== undefined) {
      category.description = dto.description;
    }

    if (dto.isActive !== undefined) {
      category.isActive = dto.isActive;
    }

    return this.categoryRepo.save(category);
  }

  async deleteCategory(shopId: string, categoryId: string): Promise<{ success: true }> {
    const category = await this.categoryRepo.findOne({ where: { id: categoryId, shopId } as any });
    if (!category) {
      throw new NotFoundException(`Category "${categoryId}" not found in this shop.`);
    }

    await this.categoryRepo.remove(category);
    return { success: true };
  }
}
