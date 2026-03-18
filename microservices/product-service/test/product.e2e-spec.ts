import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { CloudinaryService } from '../src/cloudinary/cloudinary.service';
import { AppModule } from '../src/app.module';

describe('Product catalog APIs (e2e)', () => {
  let app: INestApplication<App>;
  const deletedPublicIds: string[] = [];

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.CLOUDINARY_CLOUD_NAME = 'demo-cloud';
    process.env.CLOUDINARY_API_KEY = 'demo-key';
    process.env.CLOUDINARY_API_SECRET = 'demo-secret';
  });

  beforeEach(async () => {
    deletedPublicIds.length = 0;

    const moduleBuilder = Test.createTestingModule({
      imports: [AppModule],
    });

    moduleBuilder.overrideProvider(CloudinaryService).useValue({
      uploadProductImage: jest.fn().mockResolvedValue({
        imageUrl: 'https://cdn.example.com/products/uploaded-image.jpg',
        publicId: 'products/uploaded-image',
      }),
      deleteImage: jest.fn().mockImplementation(async (publicId: string) => {
        deletedPublicIds.push(publicId);
      }),
    });

    const moduleFixture: TestingModule = await moduleBuilder.compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  function createProduct(payload: Record<string, unknown>) {
    return request(app.getHttpServer()).post('/api/v1/products').send(payload);
  }

  function createAdminProduct(payload: Record<string, unknown>) {
    return request(app.getHttpServer()).post('/api/v1/admin/products').send(payload);
  }

  it('uploads product media through Cloudinary and returns image metadata', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/products/upload-image')
      .attach('file', Buffer.from('fake image bytes'), {
        filename: 'look.jpg',
        contentType: 'image/jpeg',
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual({
          imageUrl: 'https://cdn.example.com/products/uploaded-image.jpg',
          publicId: 'products/uploaded-image',
        });
      });
  });

  it('creates products and serves listing, detail, and related responses', async () => {
    await createProduct({
      name: 'Wide Leg Jeans',
      slug: 'wide-leg-jeans',
      sku: 'JNS-WLG-001',
      description: 'Relaxed jeans with a high waist.',
      categorySlug: 'jeans',
      basePrice: 89.99,
      mainImage: {
        imageUrl: 'https://cdn.example.com/products/jeans-main.jpg',
        publicId: 'products/jeans-main',
        altText: 'Wide leg jeans front view',
        isMain: true,
      },
      galleryImages: [],
      variants: [{ sku: 'JNS-WLG-001-BLU-M', size: 'M', color: 'Blue' }],
    }).expect(201);

    const createResponse = await createProduct({
      name: 'Oversized Denim Jacket',
      slug: 'oversized-denim-jacket',
      sku: 'JKT-DNM-001',
      description: 'Relaxed denim jacket with washed finish and metal buttons.',
      categorySlug: 'jackets',
      basePrice: 129.99,
      mainImage: {
        imageUrl: 'https://cdn.example.com/products/jacket-main.jpg',
        publicId: 'products/jacket-main',
        altText: 'Front view of oversized denim jacket',
        isMain: true,
      },
      galleryImages: [
        {
          imageUrl: 'https://cdn.example.com/products/jacket-back.jpg',
          publicId: 'products/jacket-back',
          altText: 'Back view',
          sortOrder: 1,
        },
      ],
      variants: [
        { sku: 'JKT-DNM-001-BLU-S', size: 'S', color: 'Blue' },
        { sku: 'JKT-DNM-001-BLU-M', size: 'M', color: 'Blue' },
        { sku: 'JKT-DNM-001-BLK-M', size: 'M', color: 'Black', priceOverride: 139.99 },
      ],
      relatedProductSlugs: ['wide-leg-jeans'],
    }).expect(201);

    expect(createResponse.body.slug).toBe('oversized-denim-jacket');
    expect(createResponse.body.mainImage.publicId).toBe('products/jacket-main');
    expect(createResponse.body.galleryImages).toHaveLength(1);
    expect(createResponse.body.availableSizes).toEqual(expect.arrayContaining(['S', 'M']));
    expect(createResponse.body.availableColors).toEqual(expect.arrayContaining(['Blue', 'Black']));
    expect(createResponse.body.relatedProducts).toHaveLength(1);

    await request(app.getHttpServer())
      .get('/api/v1/products?category=jackets&search=denim&sort=price-desc')
      .expect(200)
      .expect(({ body }) => {
        expect(body.total).toBe(1);
        expect(body.items[0]).toMatchObject({
          slug: 'oversized-denim-jacket',
          category: 'jackets',
          imageUrl: 'https://cdn.example.com/products/jacket-main.jpg',
        });
      });

    await request(app.getHttpServer())
      .get('/api/v1/products/oversized-denim-jacket')
      .expect(200)
      .expect(({ body }) => {
        expect(body.slug).toBe('oversized-denim-jacket');
        expect(body.variants).toHaveLength(3);
        expect(body.mainImage.imageUrl).toContain('jacket-main.jpg');
      });

    await request(app.getHttpServer())
      .get('/api/v1/products/oversized-denim-jacket/related')
      .expect(200)
      .expect(({ body }) => {
        expect(body.items).toHaveLength(1);
        expect(body.items[0].slug).toBe('wide-leg-jeans');
      });
  });

  it('cleans up uploaded assets if create product fails after image payloads are supplied', async () => {
    await createProduct({
      name: 'Starter Tee',
      slug: 'starter-tee',
      sku: 'TEE-001',
      description: 'Everyday tee.',
      categorySlug: 'shirts',
      basePrice: 29.99,
      mainImage: {
        imageUrl: 'https://cdn.example.com/products/starter-tee.jpg',
        publicId: 'products/starter-tee',
        isMain: true,
      },
      galleryImages: [],
      variants: [{ sku: 'TEE-001-BLK-M', size: 'M', color: 'Black' }],
    }).expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/products')
      .send({
        name: 'Broken Tee',
        slug: 'broken-tee',
        sku: 'TEE-002',
        description: 'This payload references a missing image.',
        categorySlug: 'shirts',
        basePrice: 31.99,
        mainImage: {
          imageUrl: 'https://cdn.example.com/products/broken-tee.jpg',
          publicId: 'products/broken-tee',
          isMain: true,
        },
        galleryImages: [],
        variants: [
          {
            sku: 'TEE-002-BLK-M',
            size: 'M',
            color: 'Black',
            imagePublicId: 'products/does-not-exist',
          },
        ],
      })
      .expect(400);

    expect(deletedPublicIds).toContain('products/broken-tee');
  });

  it('supports admin list, detail, update, and delete flows', async () => {
    const createResponse = await createAdminProduct({
      name: 'Admin Jacket',
      slug: 'admin-jacket',
      sku: 'ADM-JKT-001',
      description: 'Admin managed jacket.',
      categorySlug: 'jackets',
      basePrice: 149.99,
      mainImage: {
        imageUrl: 'https://cdn.example.com/products/admin-jacket.jpg',
        publicId: 'products/admin-jacket',
        altText: 'Admin jacket',
        isMain: true,
      },
      galleryImages: [],
      variants: [{ sku: 'ADM-JKT-001-M', size: 'M', color: 'Black' }],
    }).expect(201);

    const productId = createResponse.body.id;

    await request(app.getHttpServer())
      .get('/api/v1/admin/products?search=admin')
      .expect(200)
      .expect(({ body }) => {
        expect(body.items.some((item: { id: string }) => item.id === productId)).toBe(true);
      });

    await request(app.getHttpServer())
      .get(`/api/v1/admin/products/${productId}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.id).toBe(productId);
        expect(body.slug).toBe('admin-jacket');
      });

    await request(app.getHttpServer())
      .patch(`/api/v1/admin/products/${productId}`)
      .send({
        name: 'Admin Jacket Updated',
        slug: 'admin-jacket-updated',
        sku: 'ADM-JKT-001',
        description: 'Updated admin managed jacket.',
        categorySlug: 'jackets',
        basePrice: 159.99,
        mainImage: {
          imageUrl: 'https://cdn.example.com/products/admin-jacket-updated.jpg',
          publicId: 'products/admin-jacket-updated',
          altText: 'Admin jacket updated',
          isMain: true,
        },
        galleryImages: [],
        variants: [{ sku: 'ADM-JKT-001-M', size: 'M', color: 'Black' }],
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.slug).toBe('admin-jacket-updated');
        expect(body.basePrice).toBe(159.99);
      });

    await request(app.getHttpServer()).delete(`/api/v1/admin/products/${productId}`).expect(200);
    await request(app.getHttpServer()).get(`/api/v1/admin/products/${productId}`).expect(404);
  });
});
