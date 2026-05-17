import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'store_settings' })
export class StoreSettingsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'store_name', type: 'varchar', length: 255, default: 'Advance Technology' })
  storeName: string;

  @Column({ name: 'logo_image_url', type: 'varchar', length: 255, nullable: true })
  logoImageUrl: string | null;

  @Column({ name: 'logo_public_id', type: 'varchar', length: 255, nullable: true })
  logoPublicId: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'contact_email', type: 'varchar', length: 255, nullable: true })
  contactEmail: string | null;

  @Column({ name: 'contact_phone', type: 'varchar', length: 255, nullable: true })
  contactPhone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
