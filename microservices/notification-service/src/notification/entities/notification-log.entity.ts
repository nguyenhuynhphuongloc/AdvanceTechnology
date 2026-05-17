import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

/** Must match USER-DEFINED enum types in notification_logs table */
export enum NotificationType {
  PAYMENT_SUCCEEDED          = 'payment.succeeded',
  PAYMENT_FAILED             = 'payment.failed',
  INVENTORY_RESERVATION_FAILED = 'inventory.reservation_failed',
  INVENTORY_RESERVED         = 'inventory.reserved',
  ORDER_PLACED               = 'order.placed',
  ORDER_CONFIRMED            = 'order.confirmed',
  ORDER_SHIPPED             = 'order.shipped',
  ORDER_DELIVERED            = 'order.delivered',
  ORDER_CANCELLED            = 'order.cancelled',
}

export enum NotificationChannel {
  EMAIL   = 'email',
  SMS     = 'sms',
  WEBHOOK = 'webhook',
  PUSH    = 'push',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT    = 'sent',
  FAILED  = 'failed',
  READ    = 'read',
}

/**
 * Notification logs — rendered notifications sent to users.
 * Runtime schema: id=uuid, template_id=uuid(NOT NULL), auth_user_id=uuid,
 * type=enum, channel=enum, recipient=varchar, status=enum,
 * error_msg=text(nullable), sent_at=timestamptz(nullable).
 *
 * NOTE: This table does NOT have a created_at column.
 * All @Column decorators must use explicit 'name' to match DB column names.
 * Enum columns use 'type: "enum"' to match USER-DEFINED enum types.
 */
@Entity({ name: 'notification_logs' })
export class NotificationLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'template_id', type: 'uuid', nullable: true })
  templateId: string | null;

  @Column({ name: 'auth_user_id', type: 'uuid', nullable: true })
  authUserId: string | null;

  @Column({ name: 'type', type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ name: 'channel', type: 'enum', enum: NotificationChannel })
  channel: NotificationChannel;

  @Column({ type: 'varchar' })
  recipient: string;

  @Column({ name: 'status', type: 'enum', enum: NotificationStatus })
  status: NotificationStatus;

  @Column({ name: 'error_msg', type: 'text', nullable: true })
  errorMsg: string | null;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt: Date | null;
}
