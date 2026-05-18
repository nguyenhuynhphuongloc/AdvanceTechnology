import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

const requiredKeys = ['DB_URL'];
const redisKeys = ['REDIS_URL'];

export function validateEnvironment(config: Record<string, unknown>) {
  const isTest = config.NODE_ENV === 'test';
  const redisEnabled =
    String(config.REDIS_ENABLED ?? 'false').trim().toLowerCase() === 'true';
  const missingKeys = requiredKeys.filter((key) => {
    const value = config[key];
    return !isTest && (typeof value !== 'string' || value.trim().length === 0);
  });

  if (missingKeys.length > 0) {
    throw new Error(`Missing required product-service config: ${missingKeys.join(', ')}`);
  }

  const dbUrl = String(config.DB_URL ?? '');
  if (!isTest && dbUrl.includes('<db_password>')) {
    throw new Error(
      'Invalid product-service config: replace <db_password> in DB_URL/PRODUCT_DB_URL with the real MongoDB Atlas password.',
    );
  }

  const missingRedisKeys = redisKeys.filter((key) => {
    const value = config[key];
    return redisEnabled && !isTest && (typeof value !== 'string' || value.trim().length === 0);
  });

  if (missingRedisKeys.length > 0) {
    throw new Error(`Missing required Redis config: ${missingRedisKeys.join(', ')}`);
  }

  return config;
}

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
  ],
})
export class AppConfigModule {}
