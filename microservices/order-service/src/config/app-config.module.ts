import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

const requiredKeys = ['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE'];

function isEnabled(config: Record<string, unknown>, key: string) {
  return String(config[key] ?? 'false').trim().toLowerCase() === 'true';
}

export function validateEnvironment(config: Record<string, unknown>) {
  const isTest = config.NODE_ENV === 'test';
  const missingDbKeys = requiredKeys.filter((key) => {
    const value = config[key];
    return !isTest && (typeof value !== 'string' || value.trim().length === 0);
  });

  if (missingDbKeys.length > 0) {
    throw new Error(`Missing required order-service config: ${missingDbKeys.join(', ')}`);
  }

  if (isEnabled(config, 'RABBITMQ_ENABLED')) {
    const rabbitmqUrl = config.RABBITMQ_URL;
    const exchange = config.RABBITMQ_EXCHANGE;
    if (!isTest && (typeof rabbitmqUrl !== 'string' || rabbitmqUrl.trim().length === 0)) {
      throw new Error('Missing required order-service RabbitMQ config: RABBITMQ_URL');
    }
    if (!isTest && (typeof exchange !== 'string' || exchange.trim().length === 0)) {
      throw new Error('Missing required order-service RabbitMQ config: RABBITMQ_EXCHANGE');
    }
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
