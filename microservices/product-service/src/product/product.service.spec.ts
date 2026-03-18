import { ConfigService } from '@nestjs/config';
import { ProductService } from './product.service';
import { RedisService } from '../redis/redis.service';

describe('ProductService cache behavior', () => {
  function createService(overrides: Partial<Record<string, any>> = {}) {
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'REDIS_TTL_PRODUCT_LIST') return '120';
        if (key === 'REDIS_TTL_PRODUCT_DETAIL') return '300';
        return undefined;
      }),
    } as unknown as ConfigService;

    const redisService = {
      getJson: jest.fn(),
      setJson: jest.fn(),
      getNumber: jest.fn().mockResolvedValue(0),
      increment: jest.fn(),
      delete: jest.fn(),
    } as unknown as RedisService;

    const categoryRepository = { findOne: jest.fn(), save: jest.fn(), create: jest.fn() };
    const productRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    const imageRepository = { save: jest.fn(), create: jest.fn() };
    const variantRepository = { save: jest.fn(), create: jest.fn() };
    const relatedRepository = { save: jest.fn(), create: jest.fn(), find: jest.fn() };
    const cloudinaryService = { uploadProductImage: jest.fn(), deleteImage: jest.fn() };

    const service = new ProductService(
      configService,
      cloudinaryService as any,
      redisService,
      categoryRepository as any,
      productRepository as any,
      imageRepository as any,
      variantRepository as any,
      relatedRepository as any,
    );

    Object.assign(service as any, overrides);

    return {
      service,
      redisService,
      productRepository,
      categoryRepository,
      imageRepository,
      variantRepository,
      relatedRepository,
    };
  }

  it('returns cached product list without hitting the repository', async () => {
    const { service, redisService, productRepository } = createService();
    const cached = { items: [{ slug: 'cached-product' }], total: 1, page: 1, limit: 12 };
    (redisService.getJson as jest.Mock).mockResolvedValueOnce(cached);

    const result = await service.getProducts({ page: 1, limit: 12 });

    expect(result).toEqual(cached);
    expect(productRepository.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('loads and caches product list on cache miss', async () => {
    const { service, redisService, productRepository } = createService();
    const qb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([
        [
          {
            id: '1',
            name: 'Catalog Item',
            slug: 'catalog-item',
            sku: 'SKU-1',
            basePrice: 10,
            category: { slug: 'jackets' },
            mainImage: { imageUrl: 'https://cdn.example.com/item.jpg' },
          },
        ],
        1,
      ]),
    };
    (redisService.getJson as jest.Mock).mockResolvedValueOnce(null);
    productRepository.createQueryBuilder.mockReturnValue(qb);

    const result = await service.getProducts({ page: 1, limit: 12 });

    expect(result.items[0].slug).toBe('catalog-item');
    expect(redisService.setJson).toHaveBeenCalled();
  });

  it('invalidates catalog caches after product creation', async () => {
    const {
      service,
      redisService,
      productRepository,
      categoryRepository,
      imageRepository,
      variantRepository,
      relatedRepository,
    } =
      createService();

    const productEntity = { id: 'product-1', slug: 'fresh-drop' };
    productRepository.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'product-1',
        name: 'Fresh Drop',
        slug: 'fresh-drop',
        sku: 'SKU-FRESH',
        description: 'desc',
        basePrice: 50,
        category: { slug: 'new' },
        mainImage: {
          id: 'img-1',
          imageUrl: 'https://cdn.example.com/fresh.jpg',
          publicId: 'products/fresh',
          altText: 'alt',
          sortOrder: 0,
          isMain: true,
        },
        images: [],
        variants: [],
        isActive: true,
      });
    productRepository.find.mockResolvedValue([]);
    categoryRepository.findOne.mockResolvedValue(null);
    categoryRepository.create.mockReturnValue({ id: 'cat-1', slug: 'new', name: 'New' });
    categoryRepository.save.mockResolvedValue({ id: 'cat-1', slug: 'new', name: 'New' });
    productRepository.create.mockReturnValue(productEntity);
    productRepository.save
      .mockResolvedValueOnce(productEntity)
      .mockResolvedValueOnce({ ...productEntity, mainImage: { id: 'img-1' } });
    imageRepository.create.mockImplementation((value: any) => value);
    imageRepository.save.mockResolvedValue([
      {
        id: 'img-1',
        publicId: 'products/fresh',
        imageUrl: 'https://cdn.example.com/fresh.jpg',
        altText: 'alt',
        sortOrder: 0,
        isMain: true,
      },
    ]);
    variantRepository.create.mockImplementation((value: any) => value);
    variantRepository.save.mockResolvedValue([]);
    relatedRepository.find.mockResolvedValue([]);
    (redisService.getJson as jest.Mock).mockResolvedValueOnce(null);

    await service.createProduct({
      name: 'Fresh Drop',
      slug: 'fresh-drop',
      sku: 'SKU-FRESH',
      description: 'desc',
      categorySlug: 'new',
      basePrice: 50,
      mainImage: {
        imageUrl: 'https://cdn.example.com/fresh.jpg',
        publicId: 'products/fresh',
        altText: 'alt',
      },
      galleryImages: [],
      variants: [{ sku: 'SKU-FRESH-S', size: 'S', color: 'Blue' }],
      relatedProductSlugs: [],
    } as any);

    expect(redisService.increment).toHaveBeenCalledWith('catalog:version');
    expect(redisService.delete).toHaveBeenCalledWith('catalog:detail:fresh-drop');
  });
});
