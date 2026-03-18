import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { RabbitMqService } from '../src/messaging/rabbitmq.service';
import { RedisService } from '../src/redis/redis.service';
import request from 'supertest';
import { InventoryService } from '../src/inventory/inventory.service';

describe('Inventory workflow (e2e)', () => {
  let app: INestApplication<App>;
  let inventoryService: InventoryService;
  const store = new Map<string, string>();
  const published: Array<{ routingKey: string; payload: any }> = [];

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.REDIS_ENABLED = 'true';
    process.env.RABBITMQ_ENABLED = 'true';
  });

  beforeEach(async () => {
    store.clear();
    published.length = 0;
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(RedisService)
      .useValue({
        setJson: jest.fn(async (key: string, value: unknown) => {
          store.set(key, JSON.stringify(value));
        }),
        getJson: jest.fn(async (key: string) => {
          const value = store.get(key);
          return value ? JSON.parse(value) : null;
        }),
        delete: jest.fn(async (key: string) => {
          store.delete(key);
        }),
        keys: jest.fn(async (pattern: string) => {
          const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
          return [...store.keys()].filter((key) => regex.test(key));
        }),
      })
      .overrideProvider(RabbitMqService)
      .useValue({
        subscribe: jest.fn(),
        publish: jest.fn(async (routingKey: string, payload: unknown) => {
          published.push({ routingKey, payload });
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    inventoryService = app.get(InventoryService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('creates holds and clears them on finalize', async () => {
    const created = await inventoryService.upsertItem({
      productId: 'product-1',
      variantId: 'sku-1',
      sku: 'SKU-1',
      stock: 10,
    });

    await inventoryService.handleOrderCreated({
      orderId: 'order-1',
      correlationId: 'corr-1',
      items: [{ variantId: 'sku-1', quantity: 2, unitPrice: 25 }],
    });

    expect(store.has('inventory:hold:order-1:sku-1')).toBe(true);
    expect(published[0].routingKey).toBe('inventory.reserved');

    await inventoryService.finalizeReservation('order-1', [
      { variantId: 'sku-1', quantity: 2 },
    ]);

    expect(store.has('inventory:hold:order-1:sku-1')).toBe(false);
    const item = await inventoryService.getItem('sku-1');
    expect(item?.stock).toBe(8);
    expect(item?.reservedStock).toBe(0);
  });

  it('supports admin inventory search and quantity updates with status calculation', async () => {
    const created = await inventoryService.upsertItem({
      productId: 'product-2',
      variantId: 'variant-2',
      sku: 'SKU-LOW',
      stock: 3,
    });

    await request(app.getHttpServer())
      .get('/api/v1/admin/inventory?sku=SKU-LOW')
      .expect(200)
      .expect(({ body }) => {
        expect(body.total).toBe(1);
        expect(body.items[0].status).toBe('low-stock');
      });

    await request(app.getHttpServer())
      .patch(`/api/v1/admin/inventory/${created.id}`)
      .send({ stock: 0 })
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe('out-of-stock');
      });

    await request(app.getHttpServer())
      .patch('/api/v1/admin/inventory/missing-id')
      .send({ stock: 1 })
      .expect(404);
  });
});
