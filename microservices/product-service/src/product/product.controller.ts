import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductListQueryDto } from './dto/product-list-query.dto';

@Controller('api/v1/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required.');
    }

    if (!/^image\/(jpeg|jpg|png|webp)$/.test(file.mimetype)) {
      throw new BadRequestException('Only JPG, PNG, and WEBP images are supported.');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('Image file size must be 5MB or smaller.');
    }

    return this.productService.uploadImage(file);
  }

  @Post()
  createProduct(@Body() dto: CreateProductDto) {
    return this.productService.createProduct(dto);
  }

  @Get()
  getProducts(@Query() query: ProductListQueryDto) {
    return this.productService.getProducts(query);
  }

  @Get(':slug')
  getProductDetail(@Param('slug') slug: string) {
    return this.productService.getProductBySlug(slug);
  }

  @Get(':slug/related')
  getRelatedProducts(@Param('slug') slug: string) {
    return this.productService.getRelatedProducts(slug);
  }
}
