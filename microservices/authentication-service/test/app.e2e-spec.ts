import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';

describe('Authentication service admin auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'auth-test-secret';
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const authService = app.get(AuthService);
    await authService.createAdmin('admin@example.com', 'Password123!');
  });

  afterEach(async () => {
    await app.close();
  });

  it('logs in an admin and returns a JWT with id, email, and role', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/admin/login')
      .send({ email: 'admin@example.com', password: 'Password123!' })
      .expect(201)
      .expect(({ body }) => {
        expect(body.accessToken).toBeTruthy();
        expect(body.user.email).toBe('admin@example.com');
        expect(body.user.role).toBe('admin');
        expect(body.user.id).toBeTruthy();
      });
  });

  it('rejects invalid admin credentials', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/admin/login')
      .send({ email: 'admin@example.com', password: 'wrong-password' })
      .expect(401);
  });

  it('returns the current session and allows logout', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/admin/login')
      .send({ email: 'admin@example.com', password: 'Password123!' })
      .expect(201);

    const token = loginResponse.body.accessToken;

    await request(app.getHttpServer())
      .get('/api/v1/auth/admin/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.email).toBe('admin@example.com');
        expect(body.role).toBe('admin');
      });

    await request(app.getHttpServer())
      .post('/api/v1/auth/admin/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect(({ body }) => {
        expect(body.success).toBe(true);
      });
  });
});
