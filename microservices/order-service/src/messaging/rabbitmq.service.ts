import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import amqp, { Channel, ChannelModel, ConsumeMessage, Options } from 'amqplib';

@Injectable()
export class RabbitMqService implements OnApplicationShutdown {
  private readonly logger = new Logger(RabbitMqService.name);
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private readonly enabled: boolean;
  private readonly exchange: string;
  private readonly maxRetries = 3;

  constructor(private readonly configService: ConfigService) {
    this.enabled = this.configService.get<string>('RABBITMQ_ENABLED', 'false') === 'true';
    this.exchange = this.configService.get<string>('RABBITMQ_EXCHANGE', 'commerce.events');
  }

  isEnabled() {
    return this.enabled;
  }

  async publish(routingKey: string, payload: unknown, options: Options.Publish = {}) {
    if (!this.enabled) {
      return;
    }

    const channel = await this.getChannel();
    channel.publish(
      this.exchange,
      routingKey,
      Buffer.from(JSON.stringify(payload)),
      { persistent: true, contentType: 'application/json', ...options },
    );
  }

  async subscribe(
    queue: string,
    routingKeys: string[],
    handler: (payload: any, message: ConsumeMessage) => Promise<void>,
  ) {
    if (!this.enabled) {
      return;
    }

    const channel = await this.getChannel();
    const dlx = `${queue}.dlx`;
    const dlq = `${queue}.dlq`;
    await channel.assertExchange(this.exchange, 'topic', { durable: true });
    await channel.assertExchange(dlx, 'fanout', { durable: true });
    await channel.assertQueue(dlq, { durable: true });
    await channel.bindQueue(dlq, dlx, '');
    await channel.assertQueue(queue, {
      durable: true,
      deadLetterExchange: dlx,
    });

    for (const routingKey of routingKeys) {
      await channel.bindQueue(queue, this.exchange, routingKey);
    }

    await channel.consume(queue, async (message) => {
      if (!message) {
        return;
      }

      try {
        const payload = JSON.parse(message.content.toString());
        await handler(payload, message);
        channel.ack(message);
      } catch (error) {
        const retries = Number(message.properties.headers?.['x-retry-count'] ?? 0);
        if (retries < this.maxRetries) {
          channel.publish(
            this.exchange,
            message.fields.routingKey,
            message.content,
            {
              persistent: true,
              headers: {
                ...message.properties.headers,
                'x-retry-count': retries + 1,
              },
              correlationId: message.properties.correlationId,
              contentType: message.properties.contentType,
            },
          );
          channel.ack(message);
        } else {
          this.logger.error(
            `Dead-lettering message for ${queue}: ${
              error instanceof Error ? error.message : 'unknown error'
            }`,
          );
          channel.reject(message, false);
        }
      }
    });
  }

  async onApplicationShutdown() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }

  private async getChannel() {
    if (this.channel) {
      return this.channel;
    }

    const rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL');
    if (!rabbitmqUrl) {
      throw new Error('RABBITMQ_URL is not configured');
    }

    this.connection = await amqp.connect(rabbitmqUrl);
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
    return this.channel;
  }
}
