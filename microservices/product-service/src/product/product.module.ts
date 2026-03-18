import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { RedisModule } from '../redis/redis.module';
import { AdminProductController, ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductRelated } from './entities/product-related.entity';
import { ProductVariant } from './entities/product-variant.entity';

@Module({
  imports: [
    CloudinaryModule,
    RedisModule,
    TypeOrmModule.forFeature([Category, Product, ProductImage, ProductVariant, ProductRelated]),
  ],
  controllers: [ProductController, AdminProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
