import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { createServer, IncomingMessage, Server } from 'node:http';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { validateEnvironment } from './../src/config/config.module';

type RequiredConfig = Record<string, string>;

type RequestCapture = {
  method: string;
  url: string;
  headers: IncomingMessage['headers'];
  body: string;
};

const baseConfig = (): RequiredConfig => ({
  JWT_SECRET: 'test-secret',
  AUTH_SERVICE_URL: 'http://127.0.0.1:3001',
  USER_SERVICE_URL: 'http://127.0.0.1:3002',
  PRODUCT_SERVICE_URL: 'http://127.0.0.1:3003',
  ORDER_SERVICE_URL: 'http://127.0.0.1:3004',
  CART_SERVICE_URL: 'http://127.0.0.1:3005',
  INVENTORY_SERVICE_URL: 'http://127.0.0.1:3006',
  PAYMENT_SERVICE_URL: 'http://127.0.0.1:3007',
  NOTIFICATION_SERVICE_URL: 'http://127.0.0.1:3008',
});

const listenOnRandomPort = async (server: Server): Promise<number> => {
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to bind mock server to a random port');
  }

  return address.port;
};

const closeServer = async (server?: Server) => {
  if (!server || !server.listening) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
};

const readRequestBody = (req: IncomingMessage): Promise<string> =>
  new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });

describe('API Gateway config validation', () => {
  it('accepts config when all required keys are present', () => {
    expect(validateEnvironment(baseConfig())).toEqual(baseConfig());
  });

  it('fails validation when JWT secret is missing', () => {
    const config = baseConfig();
    delete config.JWT_SECRET;

    expect(() => validateEnvironment(config)).toThrow(/JWT_SECRET/i);
  });

  it('fails validation when a downstream service URL is missing', () => {
    const config = baseConfig();
    delete config.PRODUCT_SERVICE_URL;

    expect(() => validateEnvironment(config)).toThrow(/PRODUCT_SERVICE_URL/i);
  });
});

describe('API Gateway -> Microservice connectivity (e2e)', () => {
  let app: INestApplication;
  let productServiceServer: Server;
  let userServiceServer: Server;
  let authServiceServer: Server;
  let slowInventoryServer: Server;
  let jwtService: JwtService;
  let latestProductRequest: RequestCapture | null;
  let latestUserRequest: RequestCapture | null;
  let productPort: number;
  let gatewayConfig: RequiredConfig;

  beforeAll(async () => {
    latestProductRequest = null;
    latestUserRequest = null;

    const createProductServer = () =>
      createServer(async (req, res) => {
        const body = await readRequestBody(req);
        latestProductRequest = {
          method: req.method ?? 'GET',
          url: req.url ?? '',
          headers: req.headers,
          body,
        };

        if (!req.url) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'missing request url' }));
          return;
        }

        if (req.url.startsWith('/api/v1/products') || req.url.startsWith('/api/v1/orders')) {
          res.setHeader('content-type', 'application/json');
          res.end(
            JSON.stringify({
              ok: true,
              service: 'product',
              receivedPath: req.url,
              receivedMethod: req.method,
              receivedContentType: req.headers['content-type'] ?? null,
              receivedBody: body,
            }),
          );
          return;
        }

        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'not found' }));
      });

    productServiceServer = createProductServer();

    userServiceServer = createServer(async (req, res) => {
      const body = await readRequestBody(req);
      latestUserRequest = {
        method: req.method ?? 'GET',
        url: req.url ?? '',
        headers: req.headers,
        body,
      };

      if (!req.url) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'missing request url' }));
        return;
      }

      if (req.url.startsWith('/api/v1/users')) {
        res.setHeader('content-type', 'application/json');
        res.end(
          JSON.stringify({
            ok: true,
            service: 'user',
            receivedUserIdHeader: req.headers['x-user-id'] ?? null,
            receivedRoleHeader: req.headers['x-user-role'] ?? null,
            receivedPath: req.url,
          }),
        );
        return;
      }

      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'not found' }));
    });

    authServiceServer = createServer(async (req, res) => {
      await readRequestBody(req);
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'not found' }));
    });

    slowInventoryServer = createServer(async (req, res) => {
      await readRequestBody(req);
      const timer = setTimeout(() => {
        if (!res.writableEnded) {
          res.statusCode = 200;
          res.end(JSON.stringify({ ok: true }));
        }
      }, 5000);
      timer.unref();
    });

    productPort = await listenOnRandomPort(productServiceServer);
    const userPort = await listenOnRandomPort(userServiceServer);
    const authPort = await listenOnRandomPort(authServiceServer);
    const slowInventoryPort = await listenOnRandomPort(slowInventoryServer);

    gatewayConfig = {
      JWT_SECRET: 'test-secret',
      AUTH_SERVICE_URL: `http://127.0.0.1:${authPort}`,
      USER_SERVICE_URL: `http://127.0.0.1:${userPort}`,
      PRODUCT_SERVICE_URL: `http://127.0.0.1:${productPort}`,
      ORDER_SERVICE_URL: `http://127.0.0.1:${productPort}`,
      CART_SERVICE_URL: `http://127.0.0.1:${productPort}`,
      INVENTORY_SERVICE_URL: `http://127.0.0.1:${slowInventoryPort}`,
      PAYMENT_SERVICE_URL: `http://127.0.0.1:${productPort}`,
      NOTIFICATION_SERVICE_URL: `http://127.0.0.1:${productPort}`,
    };

    const testConfigService = {
      get<T = string>(key: string): T | undefined {
        return gatewayConfig[key] as T | undefined;
      },
      getOrThrow<T = string>(key: string): T {
        const value = gatewayConfig[key];
        if (!value) {
          throw new Error(`Missing config value: ${key}`);
        }
        return value as T;
      },
    };

    const moduleBuilder = Test.createTestingModule({
      imports: [AppModule],
    });

    moduleBuilder.overrideProvider(ConfigService).useValue(testConfigService);

    const moduleFixture: TestingModule = await moduleBuilder.compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    jwtService = new JwtService({ secret: gatewayConfig.JWT_SECRET });
  });

  afterAll(async () => {
    await app.close();
    await closeServer(productServiceServer);
    await closeServer(userServiceServer);
    await closeServer(authServiceServer);
    await closeServer(slowInventoryServer);
  });

  it('proxies public product routes to product service', () => {
    return request(app.getHttpServer())
      .get('/api/v1/products/list?limit=2')
      .expect(200)
      .expect(({ body }) => {
        expect(body.ok).toBe(true);
        expect(body.service).toBe('product');
        expect(body.receivedPath).toBe('/api/v1/products/list?limit=2');
      });
  });

  it('returns 404 for unknown gateway routes', () => {
    return request(app.getHttpServer()).get('/api/v1/unknown-service/ping').expect(404);
  });

  it('returns 401 for protected routes without a token', () => {
    return request(app.getHttpServer()).get('/api/v1/users/profile').expect(401);
  });

  it('returns 401 for invalid JWT tokens', () => {
    return request(app.getHttpServer())
      .get('/api/v1/users/profile')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  it('returns 401 for expired JWT tokens', () => {
    const expiredToken = jwtService.sign(
      { id: 'user-expired', role: 'member', email: 'expired@example.com' },
      { expiresIn: -10 },
    );

    return request(app.getHttpServer())
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
  });

  it('injects X-User-Id and X-User-Role when JWT is valid', () => {
    const token = jwtService.sign({ id: 'user-123', role: 'admin', email: 'user@example.com' });

    return request(app.getHttpServer())
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.ok).toBe(true);
        expect(body.service).toBe('user');
        expect(body.receivedUserIdHeader).toBe('user-123');
        expect(body.receivedRoleHeader).toBe('admin');
      });
  });

  it('returns 504 when downstream service times out', () => {
    const token = jwtService.sign({ id: 'user-456', role: 'member', email: 'u2@example.com' });

    return request(app.getHttpServer())
      .get('/api/v1/inventory/check')
      .set('Authorization', `Bearer ${token}`)
      .expect(504)
      .expect(({ body }) => {
        expect(body.statusCode).toBe(504);
        expect(body.message).toContain('Gateway Timeout');
      });
  });

  it('returns 502 when downstream service is unavailable', async () => {
    await closeServer(productServiceServer);

    const token = jwtService.sign({ id: 'user-789', role: 'member', email: 'u3@example.com' });

    await request(app.getHttpServer())
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ productId: 'product-1', quantity: 1 }] })
      .expect(502)
      .expect(({ body }) => {
        expect(body.statusCode).toBe(502);
      });

    productServiceServer = createServer(async (req, res) => {
      const body = await readRequestBody(req);
      latestProductRequest = {
        method: req.method ?? 'GET',
        url: req.url ?? '',
        headers: req.headers,
        body,
      };

      if (!req.url) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'missing request url' }));
        return;
      }

      if (req.url.startsWith('/api/v1/products') || req.url.startsWith('/api/v1/orders')) {
        res.setHeader('content-type', 'application/json');
        res.end(
          JSON.stringify({
            ok: true,
            service: 'product',
            receivedPath: req.url,
            receivedMethod: req.method,
            receivedContentType: req.headers['content-type'] ?? null,
            receivedBody: body,
          }),
        );
        return;
      }

      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'not found' }));
    });

    await new Promise<void>((resolve) => {
      productServiceServer.listen(productPort, '127.0.0.1', () => resolve());
    });
  });

  it('forwards complex path, query parameters, json bodies, and multipart uploads', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/products/upload/manual?mode=sync&limit=2')
      .field('metadata', '{"color":"red"}')
      .attach('file', Buffer.from('hello gateway'), 'hello.txt')
      .expect(200)
      .expect(({ body }) => {
        expect(body.ok).toBe(true);
        expect(body.receivedPath).toBe('/api/v1/products/upload/manual?mode=sync&limit=2');
        expect(body.receivedMethod).toBe('POST');
        expect(body.receivedContentType).toContain('multipart/form-data');
      });

    expect(latestProductRequest?.body).toContain('hello gateway');
    expect(latestProductRequest?.body).toContain('metadata');
    expect(latestProductRequest?.body).toContain('hello.txt');
  });
});
