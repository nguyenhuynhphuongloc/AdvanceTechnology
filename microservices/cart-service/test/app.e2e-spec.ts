import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { RedisService } from '../src/redis/redis.service';

describe('Cart API (e2e)', () => {
  let app: INestApplication<App>;
  const store = new Map<string, string>();

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.REDIS_ENABLED = 'true';
  });

  beforeEach(async () => {
    store.clear();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(RedisService)
      .useValue({
        getJson: jest.fn(async (key: string) => {
          const value = store.get(key);
          return value ? JSON.parse(value) : null;
        }),
        setJson: jest.fn(async (key: string, value: unknown) => {
          store.set(key, JSON.stringify(value));
        }),
        delete: jest.fn(async (key: string) => {
          store.delete(key);
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('stores, merges, and clears carts with Redis-backed keys', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/carts/me/items')
      .set('X-Guest-Token', 'guest-1')
      .send({ variantId: 'sku-1', quantity: 2, unitPrice: 19.99 })
      .expect(201);

    expect(store.has('cart:guest:guest-1')).toBe(true);

    await request(app.getHttpServer())
      .post('/api/v1/carts/merge')
      .set('X-User-Id', 'user-1')
      .send({ guestToken: 'guest-1' })
      .expect(201);

    expect(store.has('cart:guest:guest-1')).toBe(false);
    expect(store.has('cart:user:user-1')).toBe(true);

    await request(app.getHttpServer())
      .delete('/api/v1/carts/me')
      .set('X-User-Id', 'user-1')
      .expect(200);

    expect(store.has('cart:user:user-1')).toBe(false);
  });
});
