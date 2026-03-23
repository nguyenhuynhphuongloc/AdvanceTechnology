import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

const requiredKeys = ['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE'];
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
