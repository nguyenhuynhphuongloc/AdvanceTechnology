import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { ProductImage } from './product-image.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductRelated } from './product-related.entity';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Index('idx_products_slug', { unique: true })
  @Column({ length: 180, unique: true })
  slug: string;

  @Column({ length: 100, unique: true })
  sku: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'base_price', type: 'decimal', precision: 12, scale: 2 })
  basePrice: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Category, (category) => category.products, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToOne(() => ProductImage, { nullable: true, eager: true })
  @JoinColumn({ name: 'main_image_id' })
  mainImage?: ProductImage | null;

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: false })
  images: ProductImage[];

  @OneToMany(() => ProductVariant, (variant) => variant.product, { cascade: false })
  variants: ProductVariant[];

  @OneToMany(() => ProductRelated, (related) => related.product, { cascade: false })
  relatedLinks: ProductRelated[];
}
