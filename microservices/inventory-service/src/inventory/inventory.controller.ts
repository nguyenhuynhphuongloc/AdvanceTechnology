import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { InventoryQueryDto, SellerInventoryQueryDto, CreateInventoryItemDto, UpdateInventoryStockDto } from './dto/inventory.dto';
import { UpdateInventoryQuantityDto } from './dto/update-inventory-quantity.dto';
import { UpsertInventoryItemDto } from './dto/upsert-inventory-item.dto';
import { InventoryService } from './inventory.service';

/**
 * Extracts userId from JWT payload (req.user) OR x-user-id header.
 * Falls back to header so internal service-to-service calls work.
 */
function getUserId(req: Request): string {
  return (req as any).user?.userId ?? (req.headers['x-user-id'] as string);
}

@Controller('api/v1/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('items')
  upsertItem(@Body() dto: UpsertInventoryItemDto) {
    return this.inventoryService.upsertItem(dto);
  }

  @Get('items/:variantId')
  getItem(@Param('variantId') variantId: string) {
    return this.inventoryService.getItem(variantId);
  }
}

@Controller('api/v1/admin/inventory')
export class AdminInventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  search(@Query() query: InventoryQueryDto) {
    return this.inventoryService.search(query);
  }

  @Patch(':id')
  updateStock(@Param('id') id: string, @Body() dto: UpdateInventoryQuantityDto) {
    return this.inventoryService.updateStock(id, dto.stock);
  }
}

// ─── Seller Inventory ───────────────────────────────────────────────────────────

@Controller('api/v1/seller/inventory')
export class SellerInventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  listSellerInventory(@Query() query: SellerInventoryQueryDto, @Req() req: Request) {
    return this.inventoryService.listSellerInventory(getUserId(req), query);
  }

  @Post()
  createInventory(@Body() dto: CreateInventoryItemDto, @Req() req: Request) {
    return this.inventoryService.createSellerInventory(getUserId(req), dto);
  }

  @Patch(':variantId')
  updateInventory(
    @Param('variantId') variantId: string,
    @Body() dto: UpdateInventoryStockDto,
    @Req() req: Request,
  ) {
    return this.inventoryService.updateSellerInventoryByVariant(getUserId(req), variantId, dto);
  }
}
