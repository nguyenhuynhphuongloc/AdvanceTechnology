import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMqModule } from '../messaging/rabbitmq.module';
import { RedisModule } from '../redis/redis.module';
import { BranchModule } from '../branch/branch.module';
import { AdminInventoryController, InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryItemEntity } from './entities/inventory-item.entity';

@Module({
  imports: [RedisModule, RabbitMqModule, BranchModule, TypeOrmModule.forFeature([InventoryItemEntity])],
  controllers: [InventoryController, AdminInventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
