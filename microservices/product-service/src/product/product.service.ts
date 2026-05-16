import {
  BadRequestException,
  ForbiddenException,
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
import { SellerProductQueryDto } from './dto/seller-product-query.dto';
import {
  CategoryListResponseDto,
  CategoryResponseDto,
  CategoryQueryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/category.dto';
import { Category } from './entities/category.entity';
import { Collection } from './entities/collection.entity';
import { Product, ProductApprovalStatus } from './entities/product.entity';
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
    @InjectRepository(Collection)
    private readonly collectionRepository: MongoRepository<Collection>,
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

  async getCategories(query: CategoryQueryDto = {}): Promise<CategoryListResponseDto> {
    const where: any = {};
    if (query.search) {
      const searchRegex = { $regex: query.search.trim(), $options: 'i' };
      where.$or = [{ name: searchRegex }, { slug: searchRegex }];
    }

    const [items, total] = await this.categoryRepository.findAndCount({
      where,
      order: { name: 1 },
    });

    return {
      items: items.map((category) => this.toCategoryDto(category)),
      total,
    };
  }

  async createCategory(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const normalizedSlug = this.normalizeSlug(dto.slug);
    const normalizedName = dto.name.trim();

    if (!normalizedName || !normalizedSlug) {
      throw new BadRequestException('Category name and slug are required.');
    }

    const existing = await this.categoryRepository.findOne({
      where: { $or: [{ slug: normalizedSlug }, { name: normalizedName }] },
    });
    if (existing) {
      throw new BadRequestException('A category with the same name or slug already exists.');
    }

    if (dto.parentId) {
      const parent = await this.categoryRepository.findOne({ where: { id: dto.parentId } });
      if (!parent) {
        throw new BadRequestException('Parent category could not be found.');
      }
    }

    const category = this.categoryRepository.create({
      id: randomUUID(),
      name: normalizedName,
      slug: normalizedSlug,
      parentId: dto.parentId ?? null,
    });

    const saved = await this.categoryRepository.save(category);
    await this.invalidateCatalogCategoriesCache();
    return this.toCategoryDto(saved);
  }

  async updateCategory(id: string, dto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with id "${id}" was not found.`);
    }

    const normalizedSlug = this.normalizeSlug(dto.slug);
    const normalizedName = dto.name.trim();

    if (!normalizedName || !normalizedSlug) {
      throw new BadRequestException('Category name and slug are required.');
    }

    const duplicate = await this.categoryRepository.findOne({
      where: { $or: [{ slug: normalizedSlug }, { name: normalizedName }] },
    });
    if (duplicate && duplicate.id !== id) {
      throw new BadRequestException('A category with the same name or slug already exists.');
    }

    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new BadRequestException('A category cannot be its own parent.');
      }
      const parent = await this.categoryRepository.findOne({ where: { id: dto.parentId } });
      if (!parent) {
        throw new BadRequestException('Parent category could not be found.');
      }
    }

    category.name = normalizedName;
    category.slug = normalizedSlug;
    category.parentId = dto.parentId ?? null;

    const saved = await this.categoryRepository.save(category);
    await this.invalidateCatalogCategoriesCache();
    return this.toCategoryDto(saved);
  }

  async deleteCategory(id: string): Promise<{ success: true }> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with id "${id}" was not found.`);
    }

    const referencedProduct = await this.productRepository.findOne({ where: { categoryId: id } });
    if (referencedProduct) {
      throw new BadRequestException('This category is still assigned to products and cannot be deleted.');
    }

    await this.categoryRepository.delete({ id });
    await this.invalidateCatalogCategoriesCache();
    return { success: true };
  }

  async listMediaAssets(): Promise<{
    items: Array<{
      publicId: string;
      imageUrl: string;
      format?: string;
      width?: number;
      height?: number;
      bytes?: number;
      createdAt?: string;
      linked: boolean;
      linkedProductId?: string | null;
      linkedProductName?: string | null;
    }>;
    total: number;
  }> {
    const resources = await this.cloudinaryService.listProductImages();
    const publicIds = resources.map((resource) => resource.publicId);
    const linkedImages = publicIds.length
      ? await this.imageRepository.find({ where: { publicId: { $in: publicIds } } })
      : [];
    const productIds = [...new Set(linkedImages.map((image) => image.productId))];
    const linkedProducts = productIds.length
      ? await this.productRepository.find({ where: { id: { $in: productIds } } })
      : [];
    const imageByPublicId = new Map(linkedImages.map((image) => [image.publicId, image]));
    const productById = new Map(linkedProducts.map((product) => [product.id, product]));

    const items = resources.map((resource) => {
      const linkedImage = imageByPublicId.get(resource.publicId);
      const linkedProduct = linkedImage ? productById.get(linkedImage.productId) : null;

      return {
        ...resource,
        linked: Boolean(linkedImage),
        linkedProductId: linkedImage?.productId ?? null,
        linkedProductName: linkedProduct?.name ?? null,
      };
    });

    return {
      items,
      total: items.length,
    };
  }

  async uploadMediaAsset(file: Express.Multer.File) {
    const uploaded = await this.uploadImage(file);
    return {
      ...uploaded,
      linked: false as const,
    };
  }

  async deleteMediaAsset(publicId: string): Promise<{ success: true }> {
    const linkedImage = await this.imageRepository.findOne({ where: { publicId } });
    if (linkedImage) {
      throw new BadRequestException(
        'This media asset is still linked to a product and cannot be deleted.',
      );
    }

    await this.cloudinaryService.deleteImage(publicId);
    return { success: true };
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

    const partial: any = {
      id: randomUUID(),
      name: dto.name,
      slug: dto.slug,
      sku: dto.sku,
      description: dto.description,
      basePrice: dto.basePrice,
      categoryId: dto.categoryId,
      collectionId: dto.collectionId ?? null,
      sellerName: dto.sellerName,
      isActive: dto.isActive ?? true,
      // Marketplace fields — set by caller or default
      shopId: dto.shopId ?? null,
      sellerId: dto.sellerId ?? null,
      approvalStatus: dto.approvalStatus ?? 'pending',
      rejectionReason: null,
      approvedAt: null,
      approvedBy: null,
    };
    const product = Object.assign(new Product(), partial);

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

      // Publish product.created event with all variant IDs for inventory-service
      await this.rabbitMqService.publish('product.created', {
        productId: savedProduct.id,
        variants: savedVariants.map(v => ({ variantId: v.id, sku: v.sku })),
      });

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

    // Legacy products (no shopId) shown freely.
    // Marketplace products (has shopId) must be approved + active.
    const where: any = {
      isActive: true,
      $or: [
        { shopId: { $exists: false } },          // legacy — always visible
        { shopId: null },                         // also legacy
        {
          shopId: { $exists: true, $ne: null },
          approvalStatus: 'approved',             // marketplace — must be approved
        },
      ],
    };

    if (query.category) {
      where.categoryId = query.category;
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
      where.categoryId = query.category;
    }

    if (query.search) {
      const searchRegex = { $regex: query.search.toLowerCase(), $options: 'i' };
      where.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { sku: searchRegex },
      ];
    }

    if (query.status === 'active') {
      where.isActive = true;
    } else if (query.status === 'inactive') {
      where.isActive = false;
    }

    // Marketplace filters
    if (query.shopId) {
      where.shopId = query.shopId;
    }
    if (query.sellerId) {
      where.sellerId = query.sellerId;
    }
    if (query.approvalStatus) {
      where.approvalStatus = query.approvalStatus;
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

    // Legacy products (no shopId) are always accessible.
    // Marketplace products (has shopId) must be approved + active.
    const product = await this.productRepository.findOne({
      where: {
        slug,
        isActive: true,
        $or: [
          { shopId: { $exists: false } },
          { shopId: null },
          { shopId: { $exists: true, $ne: null }, approvalStatus: 'approved' },
        ],
      },
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
    // Legacy products (no shopId) are always accessible.
    // Marketplace products (has shopId) must be approved + active.
    const product = await this.productRepository.findOne({
      where: {
        slug,
        isActive: true,
        $or: [
          { shopId: { $exists: false } },
          { shopId: null },
          { shopId: { $exists: true, $ne: null }, approvalStatus: 'approved' },
        ],
      },
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

    product.name = dto.name;
    product.slug = dto.slug;
    product.sku = dto.sku;
    product.description = dto.description;
    product.basePrice = dto.basePrice;
    product.categoryId = dto.categoryId;
    product.collectionId = dto.collectionId ?? product.collectionId;
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

  // ─── Seller Products ──────────────────────────────────────────────────────────

  async getSellerProducts(
    sellerId: string,
    query: SellerProductQueryDto,
  ): Promise<PaginatedProductsDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: any = { sellerId };

    if (query.search) {
      const searchRegex = { $regex: query.search.toLowerCase(), $options: 'i' };
      where.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { sku: searchRegex },
      ];
    }

    if (query.status) {
      where.approvalStatus = query.status;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
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
      }),
    );

    return {
      items: productsWithImages.map((product) => this.toProductCard(product as any)),
      page,
      limit,
      total,
    };
  }

  async getSellerProductById(id: string, sellerId: string): Promise<ProductDetailDto> {
    const product = await this.productRepository.findOne({ where: { id, sellerId } });
    if (!product) {
      throw new NotFoundException(`Product with id "${id}" was not found or you do not have permission.`);
    }
    return this.getProductById(product.id);
  }

  async createSellerProduct(
    sellerId: string,
    dto: CreateProductDto,
  ): Promise<ProductDetailDto> {
    // Get shop from store-service
    const shop = await this.fetchShopBySellerId(sellerId);
    if (!shop) {
      throw new NotFoundException('You do not have a shop. Please create a shop first.');
    }
    if (shop.status === 'rejected' || shop.status === 'suspended') {
      throw new ForbiddenException(`Your shop is ${shop.status}. You cannot create products.`);
    }

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

    const product = this.productRepository.create({
      id: randomUUID(),
      name: dto.name,
      slug: dto.slug,
      sku: dto.sku,
      description: dto.description,
      basePrice: dto.basePrice,
      categoryId: dto.categoryId,
      collectionId: dto.collectionId ?? null,
      sellerName: dto.sellerName,
      isActive: dto.isActive ?? true,
      shopId: shop.id,
      sellerId,
      approvalStatus: ProductApprovalStatus.PENDING,
      rejectionReason: null,
      approvedAt: null,
      approvedBy: null,
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

      await this.rabbitMqService.publish('product.created', {
        productId: savedProduct.id,
        shopId: shop.id,
        sellerId,
        variants: savedVariants.map((v) => ({ variantId: v.id, sku: v.sku })),
      });

      await this.saveRelatedProducts(savedProduct, relatedProducts);

      await this.invalidateCatalogCache(savedProduct.slug);
      return this.getProductBySlug(savedProduct.slug);
    } catch (error) {
      await this.cleanupUploadedImages([dto.mainImage, ...(dto.galleryImages ?? [])]);
      await this.productRepository.delete({ id: savedProduct.id });
      throw error;
    }
  }

  async updateSellerProduct(
    id: string,
    sellerId: string,
    dto: UpdateProductDto,
  ): Promise<ProductDetailDto> {
    const product = await this.productRepository.findOne({ where: { id, sellerId } });
    if (!product) {
      throw new NotFoundException(`Product with id "${id}" was not found or you do not have permission.`);
    }

    const duplicate = await this.productRepository.findOne({
      where: { $and: [{ $or: [{ slug: dto.slug }, { sku: dto.sku }] }, { id: { $ne: id } }] },
    });
    if (duplicate) {
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

    product.name = dto.name;
    product.slug = dto.slug;
    product.sku = dto.sku;
    product.description = dto.description;
    product.basePrice = dto.basePrice;
    product.categoryId = dto.categoryId;
    product.collectionId = dto.collectionId ?? product.collectionId;
    product.isActive = dto.isActive ?? product.isActive;
    // Marketplace fields — preserve shop/seller/approval, only allow re-submitting
    if (product.approvalStatus === ProductApprovalStatus.REJECTED) {
      product.approvalStatus = ProductApprovalStatus.PENDING;
      product.rejectionReason = null;
    }

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

  async deleteSellerProduct(id: string, sellerId: string): Promise<{ success: true }> {
    const product = await this.productRepository.findOne({ where: { id, sellerId } });
    if (!product) {
      throw new NotFoundException(`Product with id "${id}" was not found or you do not have permission.`);
    }
    return this.deleteProduct(id);
  }

  async submitSellerProductForApproval(id: string, sellerId: string): Promise<ProductDetailDto> {
    const product = await this.productRepository.findOne({ where: { id, sellerId } });
    if (!product) {
      throw new NotFoundException(`Product with id "${id}" was not found or you do not have permission.`);
    }
    if (
      product.approvalStatus !== ProductApprovalStatus.DRAFT &&
      product.approvalStatus !== ProductApprovalStatus.REJECTED
    ) {
      throw new BadRequestException(
        `Cannot submit product with status "${product.approvalStatus}". Only draft or rejected products can be submitted.`,
      );
    }
    product.approvalStatus = ProductApprovalStatus.PENDING;
    product.rejectionReason = null;
    await this.productRepository.save(product);
    await this.invalidateCatalogCache(product.slug);
    return this.getProductById(id);
  }

  // ─── Admin Product Moderation ────────────────────────────────────────────────

  async adminCreateProduct(dto: CreateProductDto, adminId?: string): Promise<ProductDetailDto> {
    if (!dto.shopId) {
      throw new BadRequestException('shopId is required for admin product creation.');
    }

    // Verify shop exists
    await this.fetchShopById(dto.shopId);

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

    const product = this.productRepository.create({
      id: randomUUID(),
      name: dto.name,
      slug: dto.slug,
      sku: dto.sku,
      description: dto.description,
      basePrice: dto.basePrice,
      categoryId: dto.categoryId,
      collectionId: dto.collectionId ?? null,
      sellerName: dto.sellerName,
      isActive: dto.isActive ?? true,
      shopId: dto.shopId,
      sellerId: dto.sellerId ?? null,
      approvalStatus: ProductApprovalStatus.APPROVED,
      rejectionReason: null,
      approvedAt: new Date(),
      approvedBy: adminId ?? null,
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

      await this.rabbitMqService.publish('product.created', {
        productId: savedProduct.id,
        shopId: savedProduct.shopId,
        sellerId: savedProduct.sellerId,
        variants: savedVariants.map((v) => ({ variantId: v.id, sku: v.sku })),
      });

      await this.saveRelatedProducts(savedProduct, relatedProducts);

      await this.invalidateCatalogCache(savedProduct.slug);
      return this.getProductBySlug(savedProduct.slug);
    } catch (error) {
      await this.cleanupUploadedImages([dto.mainImage, ...(dto.galleryImages ?? [])]);
      await this.productRepository.delete({ id: savedProduct.id });
      throw error;
    }
  }

  async adminUpdateProduct(
    id: string,
    dto: UpdateProductDto,
    adminId?: string,
  ): Promise<ProductDetailDto> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with id "${id}" was not found.`);
    }

    const duplicate = await this.productRepository.findOne({
      where: { $and: [{ $or: [{ slug: dto.slug }, { sku: dto.sku }] }, { id: { $ne: id } }] },
    });
    if (duplicate) {
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

    product.name = dto.name;
    product.slug = dto.slug;
    product.sku = dto.sku;
    product.description = dto.description;
    product.basePrice = dto.basePrice;
    product.categoryId = dto.categoryId;
    product.collectionId = dto.collectionId ?? product.collectionId;
    product.isActive = dto.isActive ?? product.isActive;
    if (dto.shopId !== undefined) {
      product.shopId = dto.shopId;
    }

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

  async adminApproveProduct(id: string, adminId?: string): Promise<ProductDetailDto> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with id "${id}" was not found.`);
    }
    if (product.approvalStatus === ProductApprovalStatus.APPROVED) {
      throw new BadRequestException('Product is already approved.');
    }
    product.approvalStatus = ProductApprovalStatus.APPROVED;
    product.rejectionReason = null;
    product.approvedAt = new Date();
    product.approvedBy = adminId ?? null;
    await this.productRepository.save(product);
    await this.invalidateCatalogCache(product.slug);
    return this.getProductById(id);
  }

  async adminRejectProduct(
    id: string,
    rejectionReason: string,
    adminId?: string,
  ): Promise<ProductDetailDto> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with id "${id}" was not found.`);
    }
    product.approvalStatus = ProductApprovalStatus.REJECTED;
    product.rejectionReason = rejectionReason ?? null;
    product.approvedAt = null;
    product.approvedBy = adminId ?? null;
    await this.productRepository.save(product);
    await this.invalidateCatalogCache(product.slug);
    return this.getProductById(id);
  }

  async adminHideProduct(id: string, adminId?: string): Promise<ProductDetailDto> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with id "${id}" was not found.`);
    }
    product.approvalStatus = ProductApprovalStatus.HIDDEN;
    product.isActive = false;
    product.approvedAt = null;
    product.approvedBy = adminId ?? null;
    await this.productRepository.save(product);
    await this.invalidateCatalogCache(product.slug);
    return this.getProductById(id);
  }

  async adminDeleteProduct(id: string): Promise<{ success: true }> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with id "${id}" was not found.`);
    }
    return this.deleteProduct(id);
  }

  async adminAssignShopToProduct(
    id: string,
    shopId: string,
    sellerId?: string,
  ): Promise<ProductDetailDto> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with id "${id}" was not found.`);
    }
    // Verify shop exists
    const shop = await this.fetchShopById(shopId);
    product.shopId = shopId;
    product.sellerId = sellerId ?? shop.sellerId ?? null;
    await this.productRepository.save(product);
    await this.invalidateCatalogCache(product.slug);
    return this.getProductById(id);
  }

  async getProductsByShopSlug(
    slug: string,
    query: ProductListQueryDto,
  ): Promise<{ shop: any; items: ProductCardDto[]; total: number; page: number; limit: number }> {
    // Get approved shop from store-service
    const shop = await this.fetchShopBySlug(slug);
    if (!shop || shop.status !== 'approved') {
      throw new NotFoundException(`Shop with slug "${slug}" was not found.`);
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: any = {
      shopId: shop.id,
      isActive: true,
      approvalStatus: ProductApprovalStatus.APPROVED,
    };

    if (query.category) {
      where.categoryId = query.category;
    }

    if (query.search) {
      const searchRegex = { $regex: query.search.toLowerCase(), $options: 'i' };
      where.$or = [
        { name: searchRegex },
        { description: searchRegex },
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

    const productsWithImages = await Promise.all(
      items.map(async (p) => {
        const mainImage = p.mainImagePublicId
          ? await this.imageRepository.findOne({ where: { publicId: p.mainImagePublicId } })
          : null;
        return { ...p, mainImage };
      }),
    );

    return {
      shop: {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
      },
      items: productsWithImages.map((p) => this.toProductCard(p as any)),
      total,
      page,
      limit,
    };
  }

  // ─── Internal helpers ────────────────────────────────────────────────────────

  // ─── Internal Variant Validation ────────────────────────────────────────────────

  async getProductVariantForInternal(
    productId: string,
    variantId: string,
  ): Promise<{
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
  } | null> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      return null;
    }

    const variant = await this.variantRepository.findOne({ where: { id: variantId, productId } });
    if (!variant || !variant.isActive) {
      return null;
    }

    const mainImage = product.mainImagePublicId
      ? await this.imageRepository.findOne({ where: { publicId: product.mainImagePublicId } })
      : null;

    const basePrice = product.basePrice ?? 0;
    const priceOverride = variant.priceOverride ?? 0;
    const unitPrice = priceOverride > 0 ? priceOverride : basePrice;

    const variantName = [variant.size, variant.color].filter(Boolean).join(' / ');

    return {
      productId: product.id,
      variantId: variant.id,
      shopId: product.shopId ?? null,
      sellerId: product.sellerId ?? null,
      productName: product.name,
      variantName: variantName || 'Default',
      sku: variant.sku,
      imageUrl: mainImage?.imageUrl ?? null,
      unitPrice: Number(unitPrice),
      approvalStatus: product.approvalStatus,
      isActive: product.isActive ?? true,
    };
  }

  private async fetchShopBySellerId(sellerId: string): Promise<any> {
    const storeServiceUrl = this.configService.get<string>('STORE_SERVICE_URL');
    if (!storeServiceUrl) return null;
    try {
      const res = await fetch(`${storeServiceUrl}/api/v1/internal/shops/by-seller/${sellerId}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  private async fetchShopById(shopId: string): Promise<any> {
    const storeServiceUrl = this.configService.get<string>('STORE_SERVICE_URL');
    if (!storeServiceUrl) {
      throw new BadRequestException('STORE_SERVICE_URL is not configured.');
    }
    const res = await fetch(`${storeServiceUrl}/api/v1/admin/shops/${shopId}`);
    if (!res.ok) {
      throw new NotFoundException(`Shop with id "${shopId}" was not found.`);
    }
    return await res.json();
  }

  private async fetchShopBySlug(slug: string): Promise<any> {
    const storeServiceUrl = this.configService.get<string>('STORE_SERVICE_URL');
    if (!storeServiceUrl) return null;
    try {
      const res = await fetch(`${storeServiceUrl}/api/v1/shops/${slug}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  private async findOrCreateCollection(collectionSlug: string): Promise<Collection> {
    const normalizedSlug = collectionSlug.trim().toLowerCase();
    const existing = await this.collectionRepository.findOne({ where: { slug: normalizedSlug } });
    if (existing) {
      return existing;
    }

    return this.collectionRepository.save(
      this.collectionRepository.create({
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
        categoryId: product.categoryId,
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
      categoryId: product.categoryId ?? undefined,
      collectionId: product.collectionId ?? undefined,
      basePrice: basePrice !== undefined && basePrice !== null ? Number(basePrice) : 0,
      sellerName: product.sellerName,
      imageUrl: product.mainImage?.imageUrl ?? '',
      isActive: product.isActive ?? raw.is_active ?? true,
      // Marketplace fields
      shopId: product.shopId ?? null,
      sellerId: product.sellerId ?? null,
      approvalStatus: product.approvalStatus,
    };
  }

  private toCategoryDto(category: Category): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      parentId: category.parentId ?? null,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
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
      categoryId: product.categoryId ?? undefined,
      collectionId: product.collectionId ?? undefined,
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
      // Marketplace fields
      shopId: product.shopId ?? null,
      sellerId: product.sellerId ?? null,
      approvalStatus: product.approvalStatus,
      rejectionReason: product.rejectionReason ?? null,
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

  private normalizeSlug(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private async invalidateCatalogCategoriesCache(): Promise<void> {
    await this.redisService.increment('catalog:version');
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
