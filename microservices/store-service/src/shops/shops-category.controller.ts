import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ShopCategoriesService } from './shops-category.service';
import { ShopsService } from './shops.service';
import { CreateShopCategoryDto, UpdateShopCategoryDto } from './dto/shop-category.dto';

function getUserId(req: Request): string {
  return (req as any).user?.userId ?? (req.headers['x-user-id'] as string);
}

@Controller('api/v1/seller/categories')
export class SellerCategoriesController {
  constructor(
    private readonly categoriesService: ShopCategoriesService,
    private readonly shopsService: ShopsService,
  ) {}

  @Get()
  async getMyCategories(@Req() req: Request) {
    const shop = await this.getMyShop(req);
    return this.categoriesService.getCategoriesByShop(shop.id);
  }

  @Post()
  async createCategory(@Req() req: Request, @Body() dto: CreateShopCategoryDto) {
    const shop = await this.getMyShop(req);
    return this.categoriesService.createCategory(shop.id, dto);
  }

  @Patch(':id')
  async updateCategory(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateShopCategoryDto,
  ) {
    const shop = await this.getMyShop(req);
    return this.categoriesService.updateCategory(shop.id, id, dto);
  }

  @Delete(':id')
  async deleteCategory(@Req() req: Request, @Param('id') id: string) {
    const shop = await this.getMyShop(req);
    return this.categoriesService.deleteCategory(shop.id, id);
  }

  private async getMyShop(req: Request): Promise<any> {
    const userId = getUserId(req);
    return this.shopsService.getShopBySeller(userId);
  }
}
