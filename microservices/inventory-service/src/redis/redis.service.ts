import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnApplicationShutdown {
  private readonly logger = new Logger(RedisService.name);
  private readonly client?: Redis;

  constructor(private readonly configService: ConfigService) {
    const enabled = this.configService
      .get<string>('REDIS_ENABLED', 'false')
      .toLowerCase() === 'true';
    const redisUrl = this.configService.get<string>('REDIS_URL');

    if (enabled && redisUrl) {
      this.client = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
      });
      this.client.on('error', (error) => {
        this.logger.warn(`Redis error: ${error.message}`);
      });
    }
  }

  async setJson(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    await this.execute(async (client) => {
      await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    });
  }

  async getJson<T>(key: string): Promise<T | null> {
    return this.execute(async (client) => {
      const value = await client.get(key);
      return value ? (JSON.parse(value) as T) : null;
    }, null);
  }

  async delete(key: string): Promise<void> {
    await this.execute(async (client) => {
      await client.del(key);
    });
  }

  async keys(pattern: string): Promise<string[]> {
    return this.execute(async (client) => client.keys(pattern), []);
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.client) {
      await this.client.quit();
    }
  }

  private async execute<T>(action: (client: Redis) => Promise<T>, fallback?: T): Promise<T | undefined> {
    if (!this.client) {
      return fallback;
    }

    await this.ensureConnected();
    return action(this.client);
  }

  private async ensureConnected(): Promise<void> {
    if (this.client && this.client.status === 'wait') {
      await this.client.connect();
    }
  }
}
