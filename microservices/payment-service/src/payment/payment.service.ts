import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { RabbitMqService } from '../messaging/rabbitmq.service';
import { AdminPaymentQueryDto } from './dto/admin-payment-query.dto';
import { PaymentTransactionEntity } from './entities/payment-transaction.entity';

@Injectable()
export class PaymentService implements OnModuleInit {
  private stripe: Stripe;

  constructor(
    private readonly rabbitMqService: RabbitMqService,
    private readonly configService: ConfigService,
    @InjectRepository(PaymentTransactionEntity)
    private readonly transactionRepository: Repository<PaymentTransactionEntity>,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.stripe = new Stripe(stripeSecretKey || 'sk_test_placeholder', {
      apiVersion: '2025-01-27-acacia' as any,
    });
  }

  async onModuleInit() {
    await this.rabbitMqService.subscribe(
      'payment.inventory-reserved',
      ['inventory.reserved'],
      async (payload) => {
        await this.processReservedInventory(payload);
      },
    );
  }

  getTransactions() {
    return this.transactionRepository.find({ order: { createdAt: 'DESC' } });
  }

  async searchTransactions(query: AdminPaymentQueryDto) {
    const qb = this.transactionRepository.createQueryBuilder('payment');

    if (query.orderId) {
      qb.andWhere('payment.orderId = :orderId', { orderId: query.orderId });
    }

    if (query.status) {
      qb.andWhere('payment.status = :status', { status: query.status });
    }

    if (query.search) {
      qb.andWhere(
        '(payment.orderId ILIKE :search OR payment.gatewayRef ILIKE :search OR payment.method ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const items = await qb.orderBy('payment.createdAt', 'DESC').getMany();
    return {
      items,
      total: items.length,
    };
  }

  async getPaymentByOrderId(orderId: string) {
    return this.transactionRepository.findOne({ where: { orderId } });
  }

  async getTransactionById(id: string) {
    return this.transactionRepository.findOne({ where: { id } });
  }

  async createTransaction(data: {
    orderId: string;
    method: string;
    amount: number;
    status?: string;
    gatewayRef?: string | null;
  }) {
    const entity = this.transactionRepository.create({
      orderId: data.orderId,
      method: data.method,
      amount: data.amount,
      status: data.status ?? 'pending',
      gatewayRef: data.gatewayRef ?? null,
      gatewayPayload: {},
    });
    return this.transactionRepository.save(entity);
  }

  /**
   * Create a Stripe PaymentIntent and return the clientSecret for the frontend.
   */
  async createPaymentIntent(data: { orderId: string; amount: number; currency?: string }) {
    const amountInCents = Math.round(data.amount * 100);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency: data.currency || 'vnd',
      metadata: { orderId: data.orderId },
      automatic_payment_methods: { enabled: true },
    });

    // Save transaction record
    await this.transactionRepository.save(
      this.transactionRepository.create({
        orderId: data.orderId,
        method: 'stripe',
        amount: data.amount,
        status: 'pending',
        gatewayPayload: { clientSecret: paymentIntent.client_secret, intentId: paymentIntent.id },
      }),
    );

    return { clientSecret: paymentIntent.client_secret };
  }

  private async processReservedInventory(payload: any) {
    const amount = Math.round((payload.totalAmount ?? 0) * 100); // Stripe uses cents

    const transaction = await this.transactionRepository.save(
      this.transactionRepository.create({
        orderId: payload.orderId,
        method: payload.paymentMethod ?? 'stripe',
        amount: payload.totalAmount ?? 0,
        status: 'pending',
        gatewayPayload: { intentId: 'pending' },
      }),
    );

    try {
      // Create a PaymentIntent with Stripe
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        metadata: {
          orderId: payload.orderId,
          transactionId: transaction.id.toString(),
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      transaction.gatewayRef = paymentIntent.id;
      transaction.gatewayPayload = { clientSecret: paymentIntent.client_secret, intentId: paymentIntent.id };
      // In a real flow, we would send the clientSecret back to the client
      // For this demo/service, we simulate success if the key is placeholder OR if not explicitly failed
      const success = this.configService.get('STRIPE_SECRET_KEY') ? true : payload.simulatePaymentFailure !== true;
      
      transaction.status = success ? 'success' : 'failed';
      await this.transactionRepository.save(transaction);

      const routingKey = success ? 'payment.succeeded' : 'payment.failed';
      await this.rabbitMqService.publish(
        routingKey,
        {
          orderId: payload.orderId,
          correlationId: payload.correlationId,
          items: payload.items,
          amount: transaction.amount,
          transactionId: transaction.id,
          recipientEmail: payload.recipientEmail ?? null,
          clientSecret: paymentIntent.client_secret,
          reason: success ? null : 'simulated_failure',
        },
        { correlationId: payload.correlationId },
      );
    } catch (error) {
      transaction.status = 'failed';
      await this.transactionRepository.save(transaction);
      
      await this.rabbitMqService.publish(
        'payment.failed',
        {
          orderId: payload.orderId,
          correlationId: payload.correlationId,
          reason: error.message,
        },
        { correlationId: payload.correlationId },
      );
    }
  }
}
