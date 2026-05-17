import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMqModule } from '../messaging/rabbitmq.module';
import { RedisModule } from '../redis/redis.module';
import { BranchModule } from '../branch/branch.module';
import { AdminInventoryController, InventoryController, SellerInventoryController } from './inventory.controller';
import { InternalInventoryController } from './internal-inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryItemEntity } from './entities/inventory-item.entity';
import { InventoryTransactionEntity } from './entities/inventory-transaction.entity';

@Module({
  imports: [
    RedisModule,
    RabbitMqModule,
    BranchModule,
    TypeOrmModule.forFeature([InventoryItemEntity, InventoryTransactionEntity]),
  ],
  controllers: [InventoryController, AdminInventoryController, SellerInventoryController, InternalInventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
