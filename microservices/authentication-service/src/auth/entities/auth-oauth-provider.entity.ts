import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * OAuth provider links — connects a user account to external OAuth providers.
 * Runtime schema: id=uuid, user_id=uuid, provider=enum, provider_uid=varchar, linked_at=timestamptz.
 *
 * Supports marketplace multi-login (Google, Facebook, etc.).
 */
@Entity({ name: 'auth_oauth_providers' })
export class AuthOAuthProviderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar' })
  provider: string;

  @Column({ name: 'provider_uid', type: 'varchar' })
  providerUid: string;

  @CreateDateColumn({ name: 'linked_at' })
  linkedAt: Date;
}
