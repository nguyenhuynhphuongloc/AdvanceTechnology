import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

@Entity({ name: 'collections' })
export class Collection {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ unique: true })
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;
}
