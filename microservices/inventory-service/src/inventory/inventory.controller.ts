import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { UpdateInventoryQuantityDto } from './dto/update-inventory-quantity.dto';
import { UpsertInventoryItemDto } from './dto/upsert-inventory-item.dto';
import { InventoryService } from './inventory.service';

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
