import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

@Entity({ name: 'product_related' })
export class ProductRelated {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ unique: true })
  id: string;

  @Column()
  productId: string;

  @Column()
  relatedProductId: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;
}
