import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/**
 * Notification templates — email/SMS templates keyed by type.
 * Runtime schema: id=uuid, key=varchar, subject=varchar, body_html=text, updated_at.
 *
 * 3 rows exist in runtime — these are pre-seeded notification templates.
 */
@Entity({ name: 'notification_templates' })
export class NotificationTemplateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  key: string;

  @Column({ type: 'varchar' })
  subject: string;

  @Column({ name: 'body_html', type: 'text' })
  bodyHtml: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
