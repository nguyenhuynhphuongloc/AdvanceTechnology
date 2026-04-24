import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { RabbitMqService } from '../messaging/rabbitmq.service';
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

  private async processReservedInventory(payload: any) {
    const amount = Math.round((payload.totalAmount ?? 0) * 100); // Stripe uses cents

    const transaction = await this.transactionRepository.save(
      this.transactionRepository.create({
        orderId: payload.orderId,
        method: payload.paymentMethod ?? 'stripe',
        amount: payload.totalAmount ?? 0,
        status: 'pending',
        gatewayRef: 'pending_stripe_intent',
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
