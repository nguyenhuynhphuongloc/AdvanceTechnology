import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from './entities/shop.entity';
import { ShopCategory } from './entities/shop-category.entity';
import { ShopsController } from './shops.controller';
import { SellerShopController } from './shops.controller';
import { AdminShopsController } from './shops.controller';
import { InternalShopsController } from './shops.controller';
import { SellerCategoriesController } from './shops-category.controller';
import { ShopsService } from './shops.service';
import { ShopCategoriesService } from './shops-category.service';

@Module({
  imports: [TypeOrmModule.forFeature([Shop, ShopCategory])],
  controllers: [
    ShopsController,
    SellerShopController,
    AdminShopsController,
    InternalShopsController,
    SellerCategoriesController,
  ],
  providers: [ShopsService, ShopCategoriesService],
  exports: [ShopsService],
})
export class ShopsModule {}
