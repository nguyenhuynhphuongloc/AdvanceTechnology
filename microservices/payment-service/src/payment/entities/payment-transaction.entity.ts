import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Payment transactions table — one row per payment attempt.
 * Runtime schema: id=uuid, order_id=uuid, amount=numeric, method=enum, status=enum,
 * gateway_payload=jsonb, gateway_ref=varchar, created_at, updated_at.
 *
 * NOTE: Runtime uses gateway_payload (jsonb) to store the full Stripe payload
 * including clientSecret, paymentIntent id, etc. — not separate string columns.
 * The amount is stored as numeric for precision, not float.
 */
@Entity({ name: 'transactions' })
export class PaymentTransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Column({ type: 'varchar' })
  method: string;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  amount: number;

  @Column({ type: 'varchar' })
  status: string;

  @Column({ name: 'gateway_payload', type: 'jsonb', default: {} })
  gatewayPayload: Record<string, unknown>;

  @Column({ name: 'gateway_ref', type: 'varchar', nullable: true })
  gatewayRef: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
