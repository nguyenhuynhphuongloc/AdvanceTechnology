import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './core/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  
  // Apply Global Exception Filter for Gateway errors (502 / 504)
  app.useGlobalFilters(new AllExceptionsFilter());
  
  // Enable CORS if needed (often a requirement for gateways handled at the edge)
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, x-user-id, x-user-role, x-guest-token',
  });

  const server = app.getHttpServer();
  server.setTimeout(600000); // 10 minutes timeout for Native HTTP Server
  await app.listen(port);
  console.log(`API Gateway is running on: http://localhost:${port}`);
}

bootstrap();
