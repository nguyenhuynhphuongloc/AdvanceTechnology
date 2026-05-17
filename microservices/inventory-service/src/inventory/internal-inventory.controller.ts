import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { IsArray, ValidateNested, IsString, IsNumber, IsPositive, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { InventoryService } from './inventory.service';

class ReserveItemDto {
  @IsString()
  shopId: string;

  @IsString()
  variantId: string;

  @IsNumber()
  @IsPositive()
  quantity: number;
}

class ReserveItemsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReserveItemDto)
  items: ReserveItemDto[];
}

class ReleaseItemDto {
  @IsString()
  shopId: string;

  @IsString()
  variantId: string;

  @IsNumber()
  @IsPositive()
  quantity: number;
}

class ReleaseItemsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReleaseItemDto)
  items: ReleaseItemDto[];
}

class CommitItemDto {
  @IsString()
  shopId: string;

  @IsString()
  variantId: string;

  @IsNumber()
  @IsPositive()
  quantity: number;
}

class CommitItemsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CommitItemDto)
  items: CommitItemDto[];
}

@Controller('api/v1/internal/inventory')
export class InternalInventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('reserve')
  async reserveStock(@Body() dto: ReserveItemsDto) {
    return this.inventoryService.reserveInventoryItems(dto.items);
  }

  @Post('release')
  async releaseStock(@Body() dto: ReleaseItemsDto) {
    return this.inventoryService.releaseInventoryItems(dto.items);
  }

  @Post('commit')
  async commitStock(@Body() dto: CommitItemsDto) {
    return this.inventoryService.commitInventoryItems(dto.items);
  }
}
