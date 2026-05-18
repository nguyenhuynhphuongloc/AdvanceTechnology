import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductListQueryDto } from './dto/product-list-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdminProductQueryDto } from './dto/admin-product-query.dto';
import { SellerProductQueryDto } from './dto/seller-product-query.dto';
import {
  CategoryQueryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/category.dto';

function getUserId(req: Request): string {
  return (req as any).user?.userId ?? (req.headers['x-user-id'] as string);
}

function getAdminId(req: Request): string {
  return (req as any).user?.userId ?? (req.headers['x-user-id'] as string);
}

function validateImageFile(file?: Express.Multer.File) {
  if (!file) {
    throw new BadRequestException('Image file is required.');
  }

  if (!/^image\/(jpeg|jpg|png|webp)$/.test(file.mimetype)) {
    throw new BadRequestException('Only JPG, PNG, and WEBP images are supported.');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new BadRequestException('Image file size must be 5MB or smaller.');
  }
}

@Controller('api/v1/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    validateImageFile(file);
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

  @Patch(':id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.updateProduct(id, dto);
  }

  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }
}

@Controller('api/v1/categories')
export class CategoryController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  getCategories(@Query() query: CategoryQueryDto) {
    return this.productService.getCategories(query);
  }
}

@Controller('api/v1/admin/categories')
export class AdminCategoryController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  getCategories(@Query() query: CategoryQueryDto) {
    return this.productService.getCategories(query);
  }

  @Post()
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.productService.createCategory(dto);
  }

  @Patch(':id')
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.productService.updateCategory(id, dto);
  }

  @Delete(':id')
  deleteCategory(@Param('id') id: string) {
    return this.productService.deleteCategory(id);
  }
}

@Controller('api/v1/admin/products')
export class AdminProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('media')
  getMediaAssets() {
    return this.productService.listMediaAssets();
  }

  @Post('media/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadMediaAsset(@UploadedFile() file: Express.Multer.File) {
    validateImageFile(file);
    return this.productService.uploadMediaAsset(file);
  }

  @Delete('media')
  deleteMediaAsset(@Query('publicId') publicId?: string) {
    if (!publicId?.trim()) {
      throw new BadRequestException('publicId query parameter is required.');
    }

    return this.productService.deleteMediaAsset(publicId);
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    validateImageFile(file);
    return this.productService.uploadImage(file);
  }

  @Post()
  createProduct(@Body() dto: CreateProductDto) {
    return this.productService.createProduct(dto);
  }

  @Get()
  getAdminProducts(@Query() query: AdminProductQueryDto) {
    return this.productService.getAdminProducts(query);
  }

  @Get(':id')
  getProductById(@Param('id') id: string) {
    return this.productService.getProductById(id);
  }

  @Patch(':id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.updateProduct(id, dto);
  }

  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }
}

// ─── Seller Products ────────────────────────────────────────────────────────────

@Controller('api/v1/seller/products')
export class SellerProductsController {
  constructor(private readonly productService: ProductService) {}

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    validateImageFile(file);
    return this.productService.uploadImage(file);
  }

  @Get()
  getSellerProducts(@Query() query: SellerProductQueryDto, @Req() req: Request) {
    return this.productService.getSellerProducts(getUserId(req), query);
  }

  @Get(':id')
  getSellerProduct(@Param('id') id: string, @Req() req: Request) {
    return this.productService.getSellerProductById(id, getUserId(req));
  }

  @Post()
  createSellerProduct(@Body() dto: CreateProductDto, @Req() req: Request) {
    return this.productService.createSellerProduct(getUserId(req), dto);
  }

  @Patch(':id')
  updateSellerProduct(@Param('id') id: string, @Body() dto: UpdateProductDto, @Req() req: Request) {
    return this.productService.updateSellerProduct(id, getUserId(req), dto);
  }

  @Delete(':id')
  deleteSellerProduct(@Param('id') id: string, @Req() req: Request) {
    return this.productService.deleteSellerProduct(id, getUserId(req));
  }

  @Patch(':id/submit')
  submitForApproval(@Param('id') id: string, @Req() req: Request) {
    return this.productService.submitSellerProductForApproval(id, getUserId(req));
  }
}

// ─── Shop Products (Public) ─────────────────────────────────────────────────────

@Controller('api/v1/shops/:slug/products')
export class ShopProductsController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  getShopProducts(@Param('slug') slug: string, @Query() query: ProductListQueryDto) {
    return this.productService.getProductsByShopSlug(slug, query);
  }
}

// ─── Internal Product Variant Validation ─────────────────────────────────────────

@Controller('api/v1/internal/products')
export class InternalProductsController {
  constructor(private readonly productService: ProductService) {}

  @Get(':productId/variants/:variantId')
  async getProductVariantForInternal(
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
  ) {
    const result = await this.productService.getProductVariantForInternal(productId, variantId);
    if (!result) {
      throw new NotFoundException('Product or variant not found, or variant is inactive.');
    }
    return result;
  }
}

// ─── Admin Product Moderation ─────────────────────────────────────────────────

@Controller('api/v1/admin/products/moderation')
export class AdminProductModerationController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  createProduct(@Body() dto: CreateProductDto, @Req() req: Request) {
    return this.productService.adminCreateProduct(dto, getAdminId(req));
  }

  @Patch(':id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto, @Req() req: Request) {
    return this.productService.adminUpdateProduct(id, dto, getAdminId(req));
  }

  @Patch(':id/approve')
  approveProduct(@Param('id') id: string, @Req() req: Request) {
    return this.productService.adminApproveProduct(id, getAdminId(req));
  }

  @Patch(':id/reject')
  rejectProduct(@Param('id') id: string, @Body() body: { rejectionReason?: string }, @Req() req: Request) {
    return this.productService.adminRejectProduct(id, body.rejectionReason ?? '', getAdminId(req));
  }

  @Patch(':id/hide')
  hideProduct(@Param('id') id: string, @Req() req: Request) {
    return this.productService.adminHideProduct(id, getAdminId(req));
  }

  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    return this.productService.adminDeleteProduct(id);
  }

  @Patch(':id/assign-shop')
  assignShop(
    @Param('id') id: string,
    @Body() body: { shopId: string; sellerId?: string },
  ) {
    return this.productService.adminAssignShopToProduct(id, body.shopId, body.sellerId);
  }
}
