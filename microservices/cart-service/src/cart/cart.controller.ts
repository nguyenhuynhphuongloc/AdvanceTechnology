import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getMyCart(@Headers('x-user-id') userIdHeader?: string) {
    return this.cartService.getCart(this.parseUserId(userIdHeader));
  }

  @Post('items')
  addItem(
    @Headers('x-user-id') userIdHeader: string | undefined,
    @Body() dto: AddCartItemDto,
  ) {
    return this.cartService.addItem(this.parseUserId(userIdHeader), dto);
  }

  @Patch('items/:itemId')
  updateItem(
    @Headers('x-user-id') userIdHeader: string | undefined,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(
      this.parseUserId(userIdHeader),
      this.parsePositiveInt(itemId, 'itemId'),
      dto,
    );
  }

  @Delete('items/:itemId')
  removeItem(
    @Headers('x-user-id') userIdHeader: string | undefined,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeItem(
      this.parseUserId(userIdHeader),
      this.parsePositiveInt(itemId, 'itemId'),
    );
  }

  @Delete()
  clearMyCart(@Headers('x-user-id') userIdHeader?: string) {
    return this.cartService.clearCart(this.parseUserId(userIdHeader));
  }

  @Get('internal/:userId')
  getCartByUserId(@Param('userId') userId: string) {
    return this.cartService.getCart(this.parsePositiveInt(userId, 'userId'));
  }

  @Delete('internal/:userId')
  clearByUserId(@Param('userId') userId: string) {
    return this.cartService.clearCart(this.parsePositiveInt(userId, 'userId'));
  }

  private parseUserId(userIdHeader?: string) {
    const userId = Number(userIdHeader);
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new BadRequestException('x-user-id header must be a positive integer');
    }
    return userId;
  }

  private parsePositiveInt(value: string, fieldName: string) {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException(`${fieldName} must be a positive integer`);
    }
    return parsed;
  }
}
