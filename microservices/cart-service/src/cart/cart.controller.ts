import { BadRequestException, Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { AdminCartQueryDto } from './dto/admin-cart-query.dto';
import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto/add-cart-item.dto';
import { MergeCartDto } from './dto/merge-cart.dto';

@Controller('api/v1/carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get('me')
  getCart(
    @Headers('x-user-id') userId?: string,
    @Headers('x-guest-token') guestToken?: string,
  ): Promise<any> {
    return this.cartService.getCart(this.cartService.buildOwner(userId, guestToken));
  }

  @Post('me/items')
  addItem(
    @Body() dto: AddCartItemDto,
    @Headers('x-user-id') userId?: string,
    @Headers('x-guest-token') guestToken?: string,
  ) {
    return this.cartService.addItem(
      this.cartService.buildOwner(userId, guestToken),
      dto.productId,
      dto.variantId,
      dto.quantity,
    );
  }

  @Patch('me/items/:itemId')
  updateItem(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
    @Headers('x-user-id') userId?: string,
    @Headers('x-guest-token') guestToken?: string,
  ) {
    return this.cartService.updateItemQuantity(
      this.cartService.buildOwner(userId, guestToken),
      itemId,
      dto.quantity,
    );
  }

  @Delete('me/items/:itemId')
  removeItemByItemId(
    @Param('itemId') itemId: string,
    @Headers('x-user-id') userId?: string,
    @Headers('x-guest-token') guestToken?: string,
  ) {
    return this.cartService.removeItem(
      this.cartService.buildOwner(userId, guestToken),
      itemId,
      true,
    );
  }

  @Delete('me/items/:variantId')
  removeItemByVariantId(
    @Param('variantId') variantId: string,
    @Headers('x-user-id') userId?: string,
    @Headers('x-guest-token') guestToken?: string,
  ) {
    return this.cartService.removeItem(
      this.cartService.buildOwner(userId, guestToken),
      variantId,
      false,
    );
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

@Controller('api/v1/admin/carts')
export class AdminCartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  search(@Query() query: AdminCartQueryDto) {
    return this.cartService.searchCarts(query);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.cartService.getCartById(id);
  }
}

@Controller('api/v1/internal/carts')
export class InternalCartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':userId/items')
  getCartItems(@Param('userId') userId: string): Promise<any> {
    return this.cartService.getCart(this.cartService.buildUserOwner(userId));
  }
}
