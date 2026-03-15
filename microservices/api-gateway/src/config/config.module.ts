import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

const requiredKeys = [
  'AUTH_SERVICE_URL',
  'USER_SERVICE_URL',
  'PRODUCT_SERVICE_URL',
  'ORDER_SERVICE_URL',
  'CART_SERVICE_URL',
  'INVENTORY_SERVICE_URL',
  'PAYMENT_SERVICE_URL',
  'NOTIFICATION_SERVICE_URL',
  'JWT_SECRET',
];

export function validateEnvironment(config: Record<string, unknown>) {
  const missingKeys = requiredKeys.filter((key) => {
    const value = config[key];
    return typeof value !== 'string' || value.trim().length === 0;
  });

  if (missingKeys.length > 0) {
    throw new Error(`Missing required gateway config: ${missingKeys.join(', ')}`);
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
