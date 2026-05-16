import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { RedisModule } from '../redis/redis.module';
import {
  AdminCategoryController,
  AdminProductController,
  CategoryController,
  ProductController,
} from './product.controller';
import { ProductService } from './product.service';
import { Category } from './entities/category.entity';
import { Collection } from './entities/collection.entity';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductRelated } from './entities/product-related.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { MessagingModule } from '../messaging/messaging.module';

@Module({
  imports: [
    CloudinaryModule,
    RedisModule,
    MessagingModule,
    TypeOrmModule.forFeature([Category, Collection, Product, ProductImage, ProductVariant, ProductRelated]),
  ],
  controllers: [
    ProductController,
    CategoryController,
    AdminProductController,
    AdminCategoryController,
  ],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
