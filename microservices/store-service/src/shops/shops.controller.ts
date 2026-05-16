import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ShopsService } from './shops.service';
import { CreateShopDto, UpdateShopDto, AdminUpdateShopDto, ShopActionDto } from './dto/shop.dto';

function getUserId(req: Request): string {
  return (req as any).user?.userId ?? (req.headers['x-user-id'] as string);
}

@Controller('api/v1/shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Get()
  listApprovedShops(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.shopsService.getApprovedShops(
      Number(page ?? 1),
      Number(limit ?? 20),
    );
  }

  @Get(':slug')
  getShopBySlug(@Param('slug') slug: string) {
    return this.shopsService.getApprovedShopBySlug(slug);
  }
}

@Controller('api/v1/seller/shop')
export class SellerShopController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post()
  createShop(@Req() req: Request, @Body() dto: CreateShopDto) {
    return this.shopsService.createShop(getUserId(req), dto);
  }

  @Get()
  getMyShop(@Req() req: Request) {
    return this.shopsService.getShopBySeller(getUserId(req));
  }

  @Patch()
  updateMyShop(@Req() req: Request, @Body() dto: UpdateShopDto) {
    return this.shopsService.updateShop(getUserId(req), dto);
  }
}

@Controller('api/v1/admin/shops')
export class AdminShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Get()
  listAllShops(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.shopsService.listAllShops(
      Number(page ?? 1),
      Number(limit ?? 20),
      status as any,
    );
  }

  @Get(':id')
  getShop(@Param('id') id: string) {
    return this.shopsService.getShopById(id);
  }

  @Patch(':id')
  adminUpdateShop(@Param('id') id: string, @Body() dto: AdminUpdateShopDto) {
    return this.shopsService.adminUpdateShop(id, dto);
  }

  @Patch(':id/approve')
  approveShop(@Param('id') id: string) {
    return this.shopsService.approveShop(id);
  }

  @Patch(':id/reject')
  rejectShop(@Param('id') id: string, @Body() dto: ShopActionDto) {
    return this.shopsService.rejectShop(id, dto.rejectionReason);
  }

  @Patch(':id/suspend')
  suspendShop(@Param('id') id: string) {
    return this.shopsService.suspendShop(id);
  }

  @Patch(':id/restore')
  restoreShop(@Param('id') id: string) {
    return this.shopsService.restoreShop(id);
  }
}

// ─── Internal ────────────────────────────────────────────────────────────────────

@Controller('api/v1/internal/shops')
export class InternalShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Get('by-seller/:sellerId')
  getShopBySellerId(@Param('sellerId') sellerId: string) {
    return this.shopsService.getShopBySellerId(sellerId);
  }

  @Get(':id')
  getShopById(@Param('id') id: string) {
    return this.shopsService.getShopById(id);
  }
}
