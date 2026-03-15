import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
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
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductRelated } from './entities/product-related.entity';
import { ProductVariant } from './entities/product-variant.entity';

@Injectable()
export class ProductService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
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
      name: dto.name,
      slug: dto.slug,
      sku: dto.sku,
      description: dto.description,
      basePrice: dto.basePrice.toFixed(2),
      category,
      isActive: true,
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

      return this.getProductBySlug(savedProduct.slug);
    } catch (error) {
      await this.cleanupUploadedImages([dto.mainImage, ...(dto.galleryImages ?? [])]);
      await this.productRepository.delete(savedProduct.id);
      throw error;
    }
  }

  async getProducts(query: ProductListQueryDto): Promise<PaginatedProductsDto> {
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

    return {
      items: items.map((product) => this.toProductCard(product)),
      page,
      limit,
      total,
    };
  }

  async getProductBySlug(slug: string): Promise<ProductDetailDto> {
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

    const relatedProducts = await this.resolveRelatedProducts(product);

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      category: product.category.slug,
      basePrice: Number(product.basePrice),
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

  private async findOrCreateCategory(categorySlug: string): Promise<Category> {
    const normalizedSlug = categorySlug.trim().toLowerCase();
    const existing = await this.categoryRepository.findOne({ where: { slug: normalizedSlug } });
    if (existing) {
      return existing;
    }

    return this.categoryRepository.save(
      this.categoryRepository.create({
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
}
