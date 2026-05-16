import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export interface CartItemSnapshot {
  itemId: string;
  variantId: string;
  productId: string;
  shopId: string;
  productNameSnapshot: string;
  variantNameSnapshot: string;
  skuSnapshot: string;
  imageUrlSnapshot: string;
  shopNameSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  addedAt: string;
}

@Entity({ name: 'cart_state' })
export class CartState {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  userId: string | null;

  @Column({ type: 'varchar', nullable: true, unique: true })
  guestToken: string | null;

  @Column({ type: 'varchar', unique: true })
  ownerKey: string;

  @Column({ type: 'simple-json', default: '[]' })
  items: CartItemSnapshot[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
