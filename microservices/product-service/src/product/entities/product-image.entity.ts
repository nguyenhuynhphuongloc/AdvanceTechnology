import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

@Entity({ name: 'product_images' })
export class ProductImage {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ unique: true })
  id: string;

  @Column()
  productId: string;

  @Column()
  imageUrl: string;

  @Column()
  publicId: string;

  @Column({ nullable: true })
  altText?: string;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: false })
  isMain: boolean;
}
