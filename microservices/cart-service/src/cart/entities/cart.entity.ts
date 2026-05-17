import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Legacy cart table — used by older cart flow.
 * Runtime schema: id=uuid, auth_user_id=uuid (nullable), guest_token=varchar (nullable).
 * NOTE: This table coexists with cart_state (the new JSON-based cart).
 * Both are used depending on which cart flow is active.
 * The cart_state table (uuid-based, with CartItemSnapshot JSON array) is the current primary implementation.
 * This Cart entity is kept for backwards compatibility with existing cart_items rows.
 */
@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'auth_user_id', type: 'uuid', nullable: true, unique: true })
  authUserId: string | null;

  @Column({ name: 'guest_token', type: 'varchar', nullable: true, unique: true })
  guestToken: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
