import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomUUID } from 'crypto';
import { In, MongoRepository } from 'typeorm';
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
import { RabbitMqService } from '../messaging/rabbitmq.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly configService: ConfigService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly redisService: RedisService,
    private readonly rabbitMqService: RabbitMqService,
    @InjectRepository(Category)
    private readonly categoryRepository: MongoRepository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: MongoRepository<Product>,
    @InjectRepository(ProductImage)
    private readonly imageRepository: MongoRepository<ProductImage>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: MongoRepository<ProductVariant>,
    @InjectRepository(ProductRelated)
    private readonly relatedRepository: MongoRepository<ProductRelated>,
  ) {}

  async uploadImage(file: Express.Multer.File): Promise<UploadProductImageResponseDto> {
    return this.cloudinaryService.uploadProductImage(file);
  }

  async createProduct(dto: CreateProductDto): Promise<ProductDetailDto> {
    const existing = await this.productRepository.findOne({
      where: { $or: [{ slug: dto.slug }, { sku: dto.sku }] },
    });
    if (existing) {
      throw new BadRequestException('A product with the same slug or SKU already exists.');
    }

    const relatedProducts = dto.relatedProductSlugs?.length
      ? await this.productRepository.find({
          where: { slug: { $in: dto.relatedProductSlugs } },
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
      basePrice: dto.basePrice,
      categorySlug: category.slug,
      sellerName: dto.sellerName,
      stock: dto.stock ?? 0,
      isActive: dto.isActive ?? true,
    });

    const savedProduct = await this.productRepository.save(product);

    try {
      const images = await this.saveImages(savedProduct, dto);
      const mainImage = images.find((image) => image.publicId === dto.mainImage.publicId);
      if (!mainImage) {
        throw new BadRequestException('Main image could not be resolved.');
      }

      savedProduct.mainImagePublicId = mainImage.publicId;
      await this.productRepository.save(savedProduct);

      const savedVariants = await this.saveVariants(savedProduct, dto, images);
      
      // Publish product.created event for each variant to initialize stock in inventory-service
      for (const variant of savedVariants) {
        const variantDto = dto.variants.find(v => v.sku === variant.sku);
        const stockValue = variantDto?.stock ?? dto.stock ?? 0;
        
        await this.rabbitMqService.publish('product.created', {
          productId: savedProduct.id,
          variantId: variant.id,
          sku: variant.sku,
          stock: stockValue,
        });
      }

      await this.saveRelatedProducts(savedProduct, relatedProducts);

      await this.invalidateCatalogCache(savedProduct.slug);
      return this.getProductBySlug(savedProduct.slug);
    } catch (error) {
      await this.cleanupUploadedImages([dto.mainImage, ...(dto.galleryImages ?? [])]);
      await this.productRepository.delete({ id: savedProduct.id });
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
    
    const where: any = { isActive: true };

    if (query.category) {
      where.categorySlug = query.category.toLowerCase();
    }

    if (query.sellerName) {
      where.sellerName = query.sellerName;
    }

    if (query.search) {
      const searchRegex = { $regex: query.search.toLowerCase(), $options: 'i' };
      where.$or = [
        { name: searchRegex },
        { description: searchRegex }
      ];
    }

    const sort: any = {};
    switch (query.sort) {
      case 'price-asc': sort.basePrice = 1; break;
      case 'price-desc': sort.basePrice = -1; break;
      case 'name-asc': sort.name = 1; break;
      case 'name-desc': sort.name = -1; break;
      case 'latest':
      default: sort.createdAt = -1; break;
    }

    const [items, total] = await this.productRepository.findAndCount({
      where,
      order: sort,
      skip: (page - 1) * limit,
      take: limit,
    });

    // Manually load main images
    const productsWithImages = await Promise.all(
      items.map(async (p) => {
        const mainImage = p.mainImagePublicId 
          ? await this.imageRepository.findOne({ where: { publicId: p.mainImagePublicId } })
          : null;
        return { ...p, mainImage };
      })
    );

    const response = {
      items: productsWithImages.map((product) => this.toProductCard(product as any)),
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
    
    const where: any = {};

    if (query.category) {
      where.categorySlug = query.category.toLowerCase();
    }

    if (query.search) {
      const searchRegex = { $regex: query.search.toLowerCase(), $options: 'i' };
      where.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { sku: searchRegex }
      ];
    }

    if (query.status === 'active') {
      where.isActive = true;
    } else if (query.status === 'inactive') {
      where.isActive = false;
    }

    const [items, total] = await this.productRepository.findAndCount({
      where,
      order: { updatedAt: -1 },
      skip: (page - 1) * limit,
      take: limit,
    });

    const productsWithImages = await Promise.all(
      items.map(async (p) => {
        const mainImage = p.mainImagePublicId 
          ? await this.imageRepository.findOne({ where: { publicId: p.mainImagePublicId } })
          : null;
        return { ...p, mainImage };
      })
    );

    return {
      items: productsWithImages.map((product) => this.toProductCard(product as any)),
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
    });

    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" was not found.`);
    }

    const images = await this.imageRepository.find({
      where: { productId: product.id },
      order: { sortOrder: 1 },
    });

    const variants = await this.variantRepository.find({
      where: { productId: product.id },
      order: { createdAt: 1 },
    });

    const mainImage = images.find(img => img.publicId === product.mainImagePublicId) || images[0];

    // Build response manually as relations are gone
    const response = await this.buildProductDetail({ ...product, images, variants, mainImage } as any);

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
    });

    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" was not found.`);
    }

    const mainImage = product.mainImagePublicId 
      ? await this.imageRepository.findOne({ where: { publicId: product.mainImagePublicId } })
      : null;

    return {
      items: await this.resolveRelatedProducts({ ...product, mainImage } as any),
    };
  }

  async getProductById(id: string): Promise<ProductDetailDto> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with id "${id}" was not found.`);
    }

    const images = await this.imageRepository.find({
      where: { productId: product.id },
      order: { sortOrder: 1 },
    });

    const variants = await this.variantRepository.find({
      where: { productId: product.id },
      order: { createdAt: 1 },
    });

    const mainImage = images.find(img => img.publicId === product.mainImagePublicId) || images[0];

    return this.buildProductDetail({ ...product, images, variants, mainImage } as any);
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<ProductDetailDto> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with id "${id}" was not found.`);
    }

    const duplicate = await this.productRepository.findOne({
      where: { $or: [{ slug: dto.slug }, { sku: dto.sku }] },
    });
    if (duplicate && duplicate.id !== id) {
      throw new BadRequestException('A product with the same slug or SKU already exists.');
    }

    const relatedProducts = dto.relatedProductSlugs?.length
      ? await this.productRepository.find({
          where: { slug: { $in: dto.relatedProductSlugs } },
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
    product.basePrice = dto.basePrice;
    product.categorySlug = category.slug;
    product.isActive = dto.isActive ?? product.isActive;

    await this.relatedRepository.delete({ productId: id });
    await this.variantRepository.delete({ productId: id });
    product.mainImagePublicId = null;
    await this.productRepository.save(product);
    await this.imageRepository.delete({ productId: id });

    const images = await this.saveImages(product, dto as any);
    const mainImage = images.find((image) => image.publicId === dto.mainImage.publicId);
    if (!mainImage) {
      throw new BadRequestException('Main image could not be resolved.');
    }

    product.mainImagePublicId = mainImage.publicId;
    await this.productRepository.save(product);
    await this.saveVariants(product, dto as any, images);
    await this.saveRelatedProducts(product, relatedProducts);
    await this.invalidateCatalogCache(product.slug);

    return this.getProductById(product.id);
  }

  async deleteProduct(id: string): Promise<{ success: true }> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with id "${id}" was not found.`);
    }

    const images = await this.imageRepository.find({ where: { productId: id } });
    await this.cleanupUploadedImages(images.map((image) => ({ publicId: image.publicId })));
    await this.productRepository.remove(product);
    await this.imageRepository.delete({ productId: id });
    await this.variantRepository.delete({ productId: id });
    await this.relatedRepository.delete({ productId: id });
    
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
        productId: product.id,
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
        productId: product.id,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        priceOverride: variant.priceOverride,
        imageId: image?.id,
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
          productId: product.id,
          relatedProductId: relatedProduct.id,
          sortOrder: index,
        }),
      );

    if (links.length) {
      await this.relatedRepository.save(links);
    }
  }

  private async resolveRelatedProducts(product: Product): Promise<ProductCardDto[]> {
    const explicitLinks = await this.relatedRepository.find({
      where: { productId: product.id },
      order: { sortOrder: 1 },
    });

    if (explicitLinks.length > 0) {
      const relatedIds = explicitLinks.map(l => l.relatedProductId);
      const relatedProducts = await this.productRepository.find({
        where: { id: { $in: relatedIds } }
      });
      
      // Load main images for these related products
      const withImages = await Promise.all(relatedIds.map(async id => {
        const p = relatedProducts.find(prod => prod.id === id);
        if (!p) return null;
        const mainImage = p.mainImagePublicId 
          ? await this.imageRepository.findOne({ where: { publicId: p.mainImagePublicId } })
          : null;
        return { ...p, mainImage };
      }));

      return withImages.filter(p => !!p).map((p) => this.toProductCard(p as any));
    }

    const fallback = await this.productRepository.find({
      where: {
        categorySlug: product.categorySlug,
        isActive: true,
      },
      order: { createdAt: -1 },
      take: 5, // Take 5 to ensure we have 4 excluding self
    });

    const fallbackWithImages = await Promise.all(
      fallback
        .filter((candidate) => candidate.id !== product.id)
        .slice(0, 4)
        .map(async (p) => {
          const mainImage = p.mainImagePublicId 
            ? await this.imageRepository.findOne({ where: { publicId: p.mainImagePublicId } })
            : null;
          return { ...p, mainImage };
        })
    );

    return fallbackWithImages.map((candidate) => this.toProductCard(candidate as any));
  }

  private toProductCard(product: Product & { mainImage?: ProductImage }): ProductCardDto {
    const raw = product as any;
    const basePrice = product.basePrice ?? raw.base_price;
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      category: product.categorySlug,
      basePrice: basePrice !== undefined && basePrice !== null ? Number(basePrice) : 0,
      sellerName: product.sellerName,
      stock: product.stock ?? 0,
      imageUrl: product.mainImage?.imageUrl ?? '',
      isActive: product.isActive ?? raw.is_active ?? true,
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

  private toVariantDto(variant: ProductVariant, basePrice: number, image?: ProductImage): ProductVariantDto {
    const raw = variant as any;
    const priceOverride = variant.priceOverride ?? raw.price_override;
    return {
      id: variant.id,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      price: (priceOverride !== undefined && priceOverride !== null) ? Number(priceOverride) : basePrice,
      imageUrl: image?.imageUrl ?? undefined,
    };
  }

  private async cleanupUploadedImages(
    images: Array<{ publicId: string }>,
  ): Promise<void> {
    await Promise.allSettled(
      images.map((image) => this.cloudinaryService.deleteImage(image.publicId)),
    );
  }

  private async buildProductDetail(product: Product & { images: ProductImage[], variants: ProductVariant[], mainImage: ProductImage }): Promise<ProductDetailDto> {
    const relatedProducts = await this.resolveRelatedProducts(product as any);

    const raw = product as any;
    const basePrice = product.basePrice ?? raw.base_price;
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      category: product.categorySlug,
      basePrice: basePrice !== undefined && basePrice !== null ? Number(basePrice) : 0,
      sellerName: product.sellerName,
      productionDate: product.productionDate,
      isActive: product.isActive ?? raw.is_active ?? true,
      mainImage: this.toProductImage(product.mainImage ?? product.images[0]),
      galleryImages: product.images
        .filter((image) => !product.mainImage || image.id !== product.mainImage.id)
        .map((image) => this.toProductImage(image)),
      variants: await Promise.all(product.variants
        .filter((variant) => (variant.isActive ?? (variant as any).is_active ?? true))
        .map(async (variant) => {
          const vImage = variant.imageId ? await this.imageRepository.findOne({ where: { id: variant.imageId } }) : undefined;
          const detailBasePrice = product.basePrice ?? (product as any).base_price;
          return this.toVariantDto(variant, detailBasePrice !== undefined && detailBasePrice !== null ? Number(detailBasePrice) : 0, vImage ?? undefined);
        })),
      availableSizes: [...new Set(product.variants.filter((v) => (v.isActive ?? (v as any).is_active ?? true)).map((v) => v.size))].sort(),
      availableColors: [
        ...new Set(product.variants.filter((v) => (v.isActive ?? (v as any).is_active ?? true)).map((v) => v.color)),
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
