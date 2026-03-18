import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnApplicationShutdown {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis | null;
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.enabled = this.configService.get<string>('REDIS_ENABLED', 'false') === 'true';
    const redisUrl = this.configService.get<string>('REDIS_URL');

    if (this.enabled && redisUrl) {
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

  isEnabled() {
    return this.enabled && this.client !== null;
  }

  async getJson<T>(key: string): Promise<T | null> {
    if (!this.client) {
      return null;
    }

    await this.ensureConnected();
    const value = await this.client.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  async setJson(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!this.client) {
      return;
    }

    await this.ensureConnected();
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async getNumber(key: string): Promise<number> {
    if (!this.client) {
      return 0;
    }

    await this.ensureConnected();
    const value = await this.client.get(key);
    return value ? Number(value) : 0;
  }

  async increment(key: string): Promise<number> {
    if (!this.client) {
      return 0;
    }

    await this.ensureConnected();
    return this.client.incr(key);
  }

  async delete(key: string): Promise<void> {
    if (!this.client) {
      return;
    }

    await this.ensureConnected();
    await this.client.del(key);
  }

  async onApplicationShutdown() {
    if (this.client) {
      await this.client.quit();
    }
  }

  private async ensureConnected() {
    if (!this.client) {
      return;
    }

    if (this.client.status === 'wait') {
      await this.client.connect();
    }
  }
}
