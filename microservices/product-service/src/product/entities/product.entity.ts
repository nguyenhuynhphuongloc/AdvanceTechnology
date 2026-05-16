import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'products' })
export class Product {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ unique: true })
  id: string; // Keeping UUID string for API compatibility

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

  // We will handle variants, images, and related products as separate collections or embedded
  // For this simplified migration, we'll keep them as references
}
