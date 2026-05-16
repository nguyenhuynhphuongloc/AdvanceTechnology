import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

const requiredKeys = ['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE'];

export function validateEnvironment(config: Record<string, unknown>) {
  const isTest = config.NODE_ENV === 'test';
  const missingDbKeys = requiredKeys.filter((key) => {
    const value = config[key];
    return !isTest && (typeof value !== 'string' || value.trim().length === 0);
  });

  if (missingDbKeys.length > 0) {
    throw new Error(`Missing required logging-service config: ${missingDbKeys.join(', ')}`);
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
