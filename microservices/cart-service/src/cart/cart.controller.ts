import { Body, Controller, Delete, Get, Headers, Param, Post } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartItemDto } from './dto/cart-item.dto';
import { MergeCartDto } from './dto/merge-cart.dto';

@Controller('api/v1/carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get('me')
  getCart(
    @Headers('x-user-id') userId?: string,
    @Headers('x-guest-token') guestToken?: string,
  ) {
    return this.cartService.getCart(this.cartService.buildOwner(userId, guestToken));
  }

  @Post('me/items')
  addItem(
    @Body() item: CartItemDto,
    @Headers('x-user-id') userId?: string,
    @Headers('x-guest-token') guestToken?: string,
  ) {
    return this.cartService.addItem(this.cartService.buildOwner(userId, guestToken), item);
  }

  @Delete('me/items/:variantId')
  removeItem(
    @Param('variantId') variantId: string,
    @Headers('x-user-id') userId?: string,
    @Headers('x-guest-token') guestToken?: string,
  ) {
    return this.cartService.removeItem(this.cartService.buildOwner(userId, guestToken), variantId);
  }

  @Delete('me')
  clearCart(
    @Headers('x-user-id') userId?: string,
    @Headers('x-guest-token') guestToken?: string,
  ) {
    return this.cartService.clearCart(this.cartService.buildOwner(userId, guestToken));
  }

  @Post('merge')
  mergeIntoUserCart(@Headers('x-user-id') userId: string, @Body() dto: MergeCartDto) {
    return this.cartService.mergeIntoUserCart(userId, dto);
  }
}
