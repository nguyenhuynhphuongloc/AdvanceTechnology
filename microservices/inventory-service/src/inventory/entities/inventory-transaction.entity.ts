import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum InventoryTransactionType {
  RESERVE = 'reserve',
  RELEASE = 'release',
  ADJUST = 'adjust',
  SELL   = 'sell',
}

/**
 * Inventory transaction ledger — tracks every stock movement.
 * Runtime schema: id=uuid, inventory_item_id=uuid, type=enum, quantity=int,
 * ref_order_id=uuid (nullable), occurred_at=timestamptz.
 *
 * Essential for marketplace inventory audit trail and stock reconciliation.
 */
@Entity({ name: 'inventory_transactions' })
export class InventoryTransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'inventory_item_id', type: 'uuid' })
  inventoryItemId: string;

  @Column({ type: 'varchar' })
  type: InventoryTransactionType;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'ref_order_id', type: 'uuid', nullable: true })
  refOrderId: string | null;

  @CreateDateColumn({ name: 'occurred_at' })
  occurredAt: Date;
}
