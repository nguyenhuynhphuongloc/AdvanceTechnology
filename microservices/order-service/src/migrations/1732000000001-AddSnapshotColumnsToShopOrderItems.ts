import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSnapshotColumnsToShopOrderItems1732000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('shop_order_items', [
      new TableColumn({ name: 'product_name_snapshot', type: 'varchar', length: '255', isNullable: true }),
      new TableColumn({ name: 'variant_name_snapshot', type: 'varchar', length: '255', isNullable: true }),
      new TableColumn({ name: 'sku_snapshot', type: 'varchar', length: '100', isNullable: true }),
      new TableColumn({ name: 'image_url_snapshot', type: 'varchar', length: '500', isNullable: true }),
      new TableColumn({ name: 'shop_name_snapshot', type: 'varchar', length: '255', isNullable: true }),
    ]);

    await queryRunner.query(`
      UPDATE shop_order_items
      SET
        product_name_snapshot = p.name,
        variant_name_snapshot = COALESCE(v.name, ''),
        sku_snapshot = COALESCE(v.sku, p.sku),
        image_url_snapshot = COALESCE(v.image_url, p.image_url)
      FROM products p
      LEFT JOIN product_variants v ON v.id = shop_order_items.variant_id::uuid
      WHERE p.id = shop_order_items.product_id::uuid
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('shop_order_items', [
      'product_name_snapshot',
      'variant_name_snapshot',
      'sku_snapshot',
      'image_url_snapshot',
      'shop_name_snapshot',
    ]);
  }
}
