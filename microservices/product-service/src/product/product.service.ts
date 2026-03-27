import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomUUID } from 'crypto';
import { In, Repository } from 'typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { RedisService } from '../redis/redis.service';
import { CreateProductDto } from './dto/create-product.dto';
import {
  PaginatedProductsDto,
  ProductCardDto,
  ProductDetailDto,
  ProductImageDto,
  ProductVariantDto,
  RelatedProductsDto,
  UploadProductImageResponseDto,
} from './dto/product-response.dto';
import { ProductListQueryDto } from './dto/product-list-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdminProductQueryDto } from './dto/admin-product-query.dto';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductRelated } from './entities/product-related.entity';
import { ProductVariant } from './entities/product-variant.entity';

@Injectable()
export class ProductService {
  constructor(
    private readonly configService: ConfigService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly redisService: RedisService,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly imageRepository: Repository<ProductImage>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(ProductRelated)
    private readonly relatedRepository: Repository<ProductRelated>,
  ) {}

  async uploadImage(file: Express.Multer.File): Promise<UploadProductImageResponseDto> {
    return this.cloudinaryService.uploadProductImage(file);
  }

  async createProduct(dto: CreateProductDto): Promise<ProductDetailDto> {
    const existing = await this.productRepository.findOne({
      where: [{ slug: dto.slug }, { sku: dto.sku }],
    });
    if (existing) {
      throw new BadRequestException('A product with the same slug or SKU already exists.');
    }

    const relatedProducts = dto.relatedProductSlugs?.length
      ? await this.productRepository.find({
          where: { slug: In(dto.relatedProductSlugs) },
          relations: { category: true, mainImage: true },
        })
      : [];

    if (dto.relatedProductSlugs?.length && relatedProducts.length !== dto.relatedProductSlugs.length) {
      throw new BadRequestException('One or more related products could not be found.');
    }

    const category = await this.findOrCreateCategory(dto.categorySlug);
    const product = this.productRepository.create({
      id: randomUUID(),
      name: dto.name,
      slug: dto.slug,
      sku: dto.sku,
      description: dto.description,
      basePrice: dto.basePrice.toFixed(2),
      category,
      isActive: dto.isActive ?? true,
    });

    const savedProduct = await this.productRepository.save(product);

    try {
      const images = await this.saveImages(savedProduct, dto);
      const mainImage = images.find((image) => image.publicId === dto.mainImage.publicId);
      if (!mainImage) {
        throw new BadRequestException('Main image could not be resolved.');
      }

      savedProduct.mainImage = mainImage;
      await this.productRepository.save(savedProduct);

      await this.saveVariants(savedProduct, dto, images);
      await this.saveRelatedProducts(savedProduct, relatedProducts);

      await this.invalidateCatalogCache(savedProduct.slug);
      return this.getProductBySlug(savedProduct.slug);
    } catch (error) {
      await this.cleanupUploadedImages([dto.mainImage, ...(dto.galleryImages ?? [])]);
      await this.productRepository.delete(savedProduct.id);
      throw error;
    }
  }

  async getProducts(query: ProductListQueryDto): Promise<PaginatedProductsDto> {
    const cached = await this.getCachedProductList(query);
    if (cached) {
      return cached;
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.mainImage', 'mainImage')
      .where('product.isActive = :isActive', { isActive: true });

    if (query.category) {
      qb.andWhere('category.slug = :category', { category: query.category.toLowerCase() });
    }

    if (query.search) {
      qb.andWhere('(LOWER(product.name) LIKE :search OR LOWER(product.description) LIKE :search)', {
        search: `%${query.search.toLowerCase()}%`,
      });
    }

    switch (query.sort) {
      case 'price-asc':
        qb.orderBy('product.basePrice', 'ASC');
        break;
      case 'price-desc':
        qb.orderBy('product.basePrice', 'DESC');
        break;
      case 'name-asc':
        qb.orderBy('product.name', 'ASC');
        break;
      case 'name-desc':
        qb.orderBy('product.name', 'DESC');
        break;
      case 'latest':
      default:
        qb.orderBy('product.createdAt', 'DESC');
        break;
    }

    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();

    const response = {
      items: items.map((product) => this.toProductCard(product)),
      page,
      limit,
      total,
    };

    await this.cacheProductList(query, response);
    return response;
  }

  async getAdminProducts(query: AdminProductQueryDto): Promise<PaginatedProductsDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.mainImage', 'mainImage');

    if (query.category) {
      qb.andWhere('category.slug = :category', { category: query.category.toLowerCase() });
    }

    if (query.search) {
      qb.andWhere(
        '(LOWER(product.name) LIKE :search OR LOWER(product.description) LIKE :search OR LOWER(product.sku) LIKE :search)',
        {
          search: `%${query.search.toLowerCase()}%`,
        },
      );
    }

    if (query.status === 'active') {
      qb.andWhere('product.isActive = true');
    } else if (query.status === 'inactive') {
      qb.andWhere('product.isActive = false');
    }

    qb.orderBy('product.updatedAt', 'DESC').skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return {
      items: items.map((product) => this.toProductCard(product)),
      page,
      limit,
      total,
    };
  }

  async getProductBySlug(slug: string): Promise<ProductDetailDto> {
    const cached = await this.redisService.getJson<ProductDetailDto>(this.getDetailCacheKey(slug));
    if (cached) {
      return cached;
    }

    const product = await this.productRepository.findOne({
      where: { slug, isActive: true },
      relations: {
        category: true,
        mainImage: true,
        images: true,
        variants: { image: true },
      },
      order: {
        images: { sortOrder: 'ASC' },
        variants: { createdAt: 'ASC' },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" was not found.`);
    }

    const response = await this.buildProductDetail(product);

    await this.redisService.setJson(
      this.getDetailCacheKey(slug),
      response,
      this.getCacheTtl('REDIS_TTL_PRODUCT_DETAIL', 300),
    );

    return response;
  }

  async getRelatedProducts(slug: string): Promise<RelatedProductsDto> {
    const product = await this.productRepository.findOne({
      where: { slug, isActive: true },
      relations: { category: true, mainImage: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" was not found.`);
    }

    return {
      items: await this.resolveRelatedProducts(product),
    };
  }

  async getProductById(id: string): Promise<ProductDetailDto> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: {
        category: true,
        mainImage: true,
        images: true,
        variants: { image: true },
      },
      order: {
        images: { sortOrder: 'ASC' },
        variants: { createdAt: 'ASC' },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with id "${id}" was not found.`);
    }

    return this.buildProductDetail(product);
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<ProductDetailDto> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: { images: true, variants: true, category: true, mainImage: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with id "${id}" was not found.`);
    }

    const duplicate = await this.productRepository.findOne({
      where: [{ slug: dto.slug }, { sku: dto.sku }],
    });
    if (duplicate && duplicate.id !== id) {
      throw new BadRequestException('A product with the same slug or SKU already exists.');
    }

    const relatedProducts = dto.relatedProductSlugs?.length
      ? await this.productRepository.find({
          where: { slug: In(dto.relatedProductSlugs) },
          relations: { category: true, mainImage: true },
        })
      : [];

    if (dto.relatedProductSlugs?.length && relatedProducts.length !== dto.relatedProductSlugs.length) {
      throw new BadRequestException('One or more related products could not be found.');
    }

    const category = await this.findOrCreateCategory(dto.categorySlug);
    product.name = dto.name;
    product.slug = dto.slug;
    product.sku = dto.sku;
    product.description = dto.description;
    product.basePrice = dto.basePrice.toFixed(2);
    product.category = category;
    product.isActive = dto.isActive ?? product.isActive;

    await this.relatedRepository.delete({ product: { id } as Product });
    await this.variantRepository.delete({ product: { id } as Product });
    product.mainImage = null;
    await this.productRepository.save(product);
    await this.imageRepository.delete({ product: { id } as Product });

    const images = await this.saveImages(product, dto);
    const mainImage = images.find((image) => image.publicId === dto.mainImage.publicId);
    if (!mainImage) {
      throw new BadRequestException('Main image could not be resolved.');
    }

    product.mainImage = mainImage;
    await this.productRepository.save(product);
    await this.saveVariants(product, dto, images);
    await this.saveRelatedProducts(product, relatedProducts);
    await this.invalidateCatalogCache(product.slug);

    return this.getProductById(product.id);
  }

  async deleteProduct(id: string): Promise<{ success: true }> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: { images: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with id "${id}" was not found.`);
    }

    await this.cleanupUploadedImages(product.images.map((image) => ({ publicId: image.publicId })));
    await this.productRepository.remove(product);
    await this.invalidateCatalogCache(product.slug);
    return { success: true };
  }

  private async findOrCreateCategory(categorySlug: string): Promise<Category> {
    const normalizedSlug = categorySlug.trim().toLowerCase();
    const existing = await this.categoryRepository.findOne({ where: { slug: normalizedSlug } });
    if (existing) {
      return existing;
    }

    return this.categoryRepository.save(
      this.categoryRepository.create({
        id: randomUUID(),
        slug: normalizedSlug,
        name: normalizedSlug
          .split('-')
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' '),
      }),
    );
  }

  private async saveImages(product: Product, dto: CreateProductDto): Promise<ProductImage[]> {
    const payloadImages = [
      { ...dto.mainImage, isMain: true, sortOrder: dto.mainImage.sortOrder ?? 0 },
      ...(dto.galleryImages ?? []).map((image, index) => ({
        ...image,
        isMain: false,
        sortOrder: image.sortOrder ?? index + 1,
      })),
    ];

    const uniquePublicIds = new Set<string>();
    for (const image of payloadImages) {
      if (uniquePublicIds.has(image.publicId)) {
        throw new BadRequestException(`Duplicate image publicId "${image.publicId}" in payload.`);
      }
      uniquePublicIds.add(image.publicId);
    }

    const images = payloadImages.map((image) =>
      this.imageRepository.create({
        id: randomUUID(),
        product,
        imageUrl: image.imageUrl,
        publicId: image.publicId,
        altText: image.altText,
        sortOrder: image.sortOrder ?? 0,
        isMain: image.isMain ?? false,
      }),
    );

    return this.imageRepository.save(images);
  }

  private async saveVariants(
    product: Product,
    dto: CreateProductDto,
    images: ProductImage[],
  ): Promise<ProductVariant[]> {
    if (!dto.variants.length) {
      throw new BadRequestException('At least one variant is required.');
    }

    const imageMap = new Map(images.map((image) => [image.publicId, image]));
    const uniqueOptions = new Set<string>();

    const variants = dto.variants.map((variant) => {
      const optionKey = `${variant.size.toLowerCase()}::${variant.color.toLowerCase()}`;
      if (uniqueOptions.has(optionKey)) {
        throw new BadRequestException(
          `Duplicate variant combination for size "${variant.size}" and color "${variant.color}".`,
        );
      }
      uniqueOptions.add(optionKey);

      const image = variant.imagePublicId ? imageMap.get(variant.imagePublicId) : null;
      if (variant.imagePublicId && !image) {
        throw new BadRequestException(
          `Variant image "${variant.imagePublicId}" does not match any product image.`,
        );
      }

      return this.variantRepository.create({
        id: randomUUID(),
        product,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        priceOverride: variant.priceOverride?.toFixed(2),
        image,
        isActive: true,
      });
    });

    return this.variantRepository.save(variants);
  }

  private async saveRelatedProducts(product: Product, relatedProducts: Product[]): Promise<void> {
    if (!relatedProducts.length) {
      return;
    }

    const links = relatedProducts
      .filter((relatedProduct) => relatedProduct.id !== product.id)
      .map((relatedProduct, index) =>
        this.relatedRepository.create({
          id: randomUUID(),
          product,
          relatedProduct,
          sortOrder: index,
        }),
      );

    if (links.length) {
      await this.relatedRepository.save(links);
    }
  }

  private async resolveRelatedProducts(product: Product): Promise<ProductCardDto[]> {
    const explicitLinks = await this.relatedRepository.find({
      where: { product: { id: product.id } },
      relations: { relatedProduct: { category: true, mainImage: true } },
      order: { sortOrder: 'ASC' },
    });

    if (explicitLinks.length > 0) {
      return explicitLinks.map((link) => this.toProductCard(link.relatedProduct));
    }

    const fallback = await this.productRepository.find({
      where: {
        category: { id: product.category.id },
        isActive: true,
      },
      relations: { category: true, mainImage: true },
      order: { createdAt: 'DESC' },
      take: 4,
    });

    return fallback
      .filter((candidate) => candidate.id !== product.id)
      .slice(0, 4)
      .map((candidate) => this.toProductCard(candidate));
  }

  private toProductCard(product: Product): ProductCardDto {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      category: product.category.slug,
      basePrice: Number(product.basePrice),
      imageUrl: product.mainImage?.imageUrl ?? '',
      isActive: product.isActive,
    };
  }

  private toProductImage(image?: ProductImage | null): ProductImageDto {
    if (!image) {
      throw new NotFoundException('Product image data is missing.');
    }

    return {
      id: image.id,
      imageUrl: image.imageUrl,
      publicId: image.publicId,
      altText: image.altText,
      sortOrder: image.sortOrder,
      isMain: image.isMain,
    };
  }

  private toVariantDto(variant: ProductVariant, basePrice: number): ProductVariantDto {
    return {
      id: variant.id,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      price: variant.priceOverride ? Number(variant.priceOverride) : basePrice,
      imageUrl: variant.image?.imageUrl ?? undefined,
    };
  }

  private async cleanupUploadedImages(
    images: Array<{ publicId: string }>,
  ): Promise<void> {
    await Promise.allSettled(
      images.map((image) => this.cloudinaryService.deleteImage(image.publicId)),
    );
  }

  private async buildProductDetail(product: Product): Promise<ProductDetailDto> {
    const relatedProducts = await this.resolveRelatedProducts(product);

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      category: product.category.slug,
      basePrice: Number(product.basePrice),
      isActive: product.isActive,
      mainImage: this.toProductImage(product.mainImage ?? product.images[0]),
      galleryImages: product.images
        .filter((image) => !product.mainImage || image.id !== product.mainImage.id)
        .map((image) => this.toProductImage(image)),
      variants: product.variants
        .filter((variant) => variant.isActive)
        .map((variant) => this.toVariantDto(variant, Number(product.basePrice))),
      availableSizes: [...new Set(product.variants.filter((variant) => variant.isActive).map((v) => v.size))].sort(),
      availableColors: [
        ...new Set(product.variants.filter((variant) => variant.isActive).map((v) => v.color)),
      ].sort(),
      relatedProducts,
    };
  }

  private async getCachedProductList(
    query: ProductListQueryDto,
  ): Promise<PaginatedProductsDto | null> {
    const version = await this.redisService.getNumber('catalog:version');
    return this.redisService.getJson<PaginatedProductsDto>(this.getListCacheKey(query, version));
  }

  private async cacheProductList(
    query: ProductListQueryDto,
    response: PaginatedProductsDto,
  ): Promise<void> {
    const version = await this.redisService.getNumber('catalog:version');
    await this.redisService.setJson(
      this.getListCacheKey(query, version),
      response,
      this.getCacheTtl('REDIS_TTL_PRODUCT_LIST', 120),
    );
  }

  private getListCacheKey(query: ProductListQueryDto, version: number): string {
    const hash = createHash('sha1').update(JSON.stringify(query)).digest('hex');
    return `catalog:v${version}:list:${hash}`;
  }

  private getDetailCacheKey(slug: string): string {
    return `catalog:detail:${slug}`;
  }

  private async invalidateCatalogCache(slug: string): Promise<void> {
    await this.redisService.increment('catalog:version');
    await this.redisService.delete(this.getDetailCacheKey(slug));
  }

  private getCacheTtl(key: string, fallback: number): number {
    const value = Number(this.configService.get<string>(key) ?? fallback);
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }
}
