import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'product_variants' })
export class ProductVariant {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ unique: true })
  id: string;

  @Column()
  productId: string;

  @Column({ unique: true })
  sku: string;

  @Column()
  size: string;

  @Column()
  color: string;

  @Column({ nullable: true })
  priceOverride?: number;

  @Column({ nullable: true })
  imageId?: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
