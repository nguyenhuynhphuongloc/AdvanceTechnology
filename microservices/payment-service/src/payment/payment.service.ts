import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { RabbitMqService } from '../messaging/rabbitmq.service';
import { PaymentTransactionEntity } from './entities/payment-transaction.entity';

@Injectable()
export class PaymentService implements OnModuleInit {
  constructor(
    private readonly rabbitMqService: RabbitMqService,
    @InjectRepository(PaymentTransactionEntity)
    private readonly transactionRepository: Repository<PaymentTransactionEntity>,
  ) {}

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
    const transaction = await this.transactionRepository.save(
      this.transactionRepository.create({
        orderId: payload.orderId,
        method: payload.paymentMethod ?? 'cod',
        amount: payload.totalAmount ?? 0,
        status: 'pending',
        gatewayRef: randomUUID(),
      }),
    );

    const success = payload.simulatePaymentFailure !== true;
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
        reason: success ? null : 'simulated_failure',
      },
      { correlationId: payload.correlationId },
    );
  }
}
