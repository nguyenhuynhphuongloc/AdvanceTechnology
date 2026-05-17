import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddMissingColumnsToOrders1732000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('orders', [
      new TableColumn({ name: 'order_number', type: 'varchar', length: '32', isUnique: true, isNullable: true }),
      new TableColumn({ name: 'payment_status', type: 'varchar', length: '24', default: "'pending'" }),
      new TableColumn({ name: 'currency', type: 'varchar', length: '8', default: "'VND'" }),
      new TableColumn({ name: 'note', type: 'varchar', length: '500', isNullable: true }),
      new TableColumn({ name: 'cancelled_at', type: 'timestamptz', isNullable: true }),
      new TableColumn({ name: 'cancel_reason', type: 'varchar', length: '500', isNullable: true }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('orders', [
      'order_number',
      'payment_status',
      'currency',
      'note',
      'cancelled_at',
      'cancel_reason',
    ]);
  }
}
