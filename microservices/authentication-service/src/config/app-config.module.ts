import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

const requiredKeys = ['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE', 'JWT_SECRET'];

export function validateEnvironment(config: Record<string, unknown>) {
  const isTest = config.NODE_ENV === 'test';
  const missingKeys = requiredKeys.filter((key) => {
    const value = config[key];
    return !isTest && (typeof value !== 'string' || value.trim().length === 0);
  });

  if (missingKeys.length > 0) {
    throw new Error(`Missing required authentication-service config: ${missingKeys.join(', ')}`);
  }

  return config;
}

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnvironment,
    }),
  ],
})
export class AppConfigModule {}
