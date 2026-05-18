import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ProductApprovalStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  HIDDEN = 'hidden',
}

@Entity({ name: 'products' })
export class Product {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ unique: true })
  id: string;

  @Column()
  name: string;

  @Index('idx_products_slug', { unique: true })
  @Column()
  slug: string;

  @Column({ unique: true })
  sku: string;

  @Column()
  description: string;

  @Column()
  basePrice: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  productionDate: string;

  @Column({ nullable: true })
  sellerName: string;

  @Column({ nullable: true })
  categoryId?: string | null;

  @Column({ nullable: true })
  collectionId?: string | null;

  @Column({ nullable: true })
  mainImagePublicId?: string | null;

  // ─── Marketplace fields ───────────────────────────────────────────────────────

  @Column({ nullable: true })
  shopId?: string | null;

  @Column({ nullable: true })
  sellerId?: string | null;

  @Column({
    type: 'varchar',
    default: ProductApprovalStatus.PENDING,
  })
  approvalStatus: ProductApprovalStatus;

  @Column({ nullable: true })
  rejectionReason?: string | null;

  @Column({ nullable: true })
  approvedAt?: Date | null;

  @Column({ nullable: true })
  approvedBy?: string | null;
}
