import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnApplicationShutdown {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis | null;

  constructor(private readonly configService: ConfigService) {
    const enabled = this.configService.get<string>('REDIS_ENABLED', 'false') === 'true';
    const redisUrl = this.configService.get<string>('REDIS_URL');

    if (enabled && redisUrl) {
      this.client = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
      });
      this.client.on('error', (error) => {
        this.logger.warn(`Redis error: ${error.message}`);
      });
    } else {
      this.client = null;
    }
  }

  async setJson(key: string, value: unknown, ttlSeconds: number) {
    if (!this.client) {
      return;
    }

    await this.ensureConnected();
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async getJson<T>(key: string): Promise<T | null> {
    if (!this.client) {
      return null;
    }

    await this.ensureConnected();
    const value = await this.client.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  async delete(key: string) {
    if (!this.client) {
      return;
    }

    await this.ensureConnected();
    await this.client.del(key);
  }

  async keys(pattern: string) {
    if (!this.client) {
      return [] as string[];
    }

    await this.ensureConnected();
    return this.client.keys(pattern);
  }

  async onApplicationShutdown() {
    if (this.client) {
      await this.client.quit();
    }
  }

  private async ensureConnected() {
    if (this.client && this.client.status === 'wait') {
      await this.client.connect();
    }
  }
}
