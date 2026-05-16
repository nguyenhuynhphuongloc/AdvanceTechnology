import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from './entities/shop.entity';
import { ShopsController } from './shops.controller';
import { SellerShopController } from './shops.controller';
import { AdminShopsController } from './shops.controller';
import { InternalShopsController } from './shops.controller';
import { ShopsService } from './shops.service';

@Module({
  imports: [TypeOrmModule.forFeature([Shop])],
  controllers: [ShopsController, SellerShopController, AdminShopsController, InternalShopsController],
  providers: [ShopsService],
  exports: [ShopsService],
})
export class ShopsModule {}
