import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AdminRoleGuard } from './guards/admin-role.guard';
import { SellerOrAdminRoleGuard } from './guards/seller-or-admin-role.guard';
import { CheckoutDto } from './dto/checkout.dto';
import { OrderQueryDto, AdminOrderQueryDto, SellerOrderQueryDto, AdminShopOrderQueryDto } from './dto/order-query.dto';
import { ShipOrderDto, CancelOrderDto, AdminUpdateShopOrderStatusDto } from './dto/seller-order.dto';
import { OrdersService } from './orders.service';

function getUserId(req: Request): string {
  return (req as any).user?.userId ?? (req.headers['x-user-id'] as string) ?? '';
}

function getUserRole(req: Request): string {
  return (req as any).user?.role ?? (req.headers['x-user-role'] as string) ?? '';
}

function parseUUID(value: string, fieldName: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(value)) {
    throw new BadRequestException(`${fieldName} must be a valid UUID`);
  }
  return value;
}

function parsePage(value: string | undefined): number {
  const n = parseInt(value ?? '1');
  return isNaN(n) || n < 1 ? 1 : n;
}

// ─── Buyer Order APIs ────────────────────────────────────────────────────────

@Controller('api/v1/orders')
export class BuyerOrderController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  checkout(
    @Req() req: Request,
    @Body() dto: CheckoutDto,
  ) {
    const buyerId = getUserId(req);
    if (!buyerId) throw new BadRequestException('x-user-id header is required for checkout.');
    parseUUID(buyerId, 'x-user-id');
    return this.ordersService.checkout(buyerId, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  listMyOrders(@Req() req: Request, @Query() query: OrderQueryDto) {
    const buyerId = getUserId(req);
    if (!buyerId) throw new BadRequestException('x-user-id header is required.');
    parseUUID(buyerId, 'x-user-id');
    return this.ordersService.listMyOrders(buyerId, query);
  }

  @Get(':orderId')
  @UseGuards(JwtAuthGuard)
  getMyOrder(@Req() req: Request, @Param('orderId') orderId: string) {
    const buyerId = getUserId(req);
    if (!buyerId) throw new BadRequestException('x-user-id header is required.');
    parseUUID(buyerId, 'x-user-id');
    parseUUID(orderId, 'orderId');
    return this.ordersService.getMyOrder(buyerId, orderId);
  }

  @Patch(':orderId/cancel')
  @UseGuards(JwtAuthGuard)
  cancelMyOrder(
    @Req() req: Request,
    @Param('orderId') orderId: string,
    @Body() dto: CancelOrderDto,
  ) {
    const buyerId = getUserId(req);
    if (!buyerId) throw new BadRequestException('x-user-id header is required.');
    parseUUID(buyerId, 'x-user-id');
    parseUUID(orderId, 'orderId');
    return this.ordersService.cancelMyOrder(buyerId, orderId, dto);
  }
}

// ─── Seller Order APIs ──────────────────────────────────────────────────────

@Controller('api/v1/seller/orders')
export class SellerOrderController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, SellerOrAdminRoleGuard)
  listShopOrders(@Req() req: Request, @Query() query: SellerOrderQueryDto) {
    const sellerId = getUserId(req);
    if (!sellerId) throw new BadRequestException('x-user-id header is required.');
    parseUUID(sellerId, 'x-user-id');
    return this.ordersService.listSellerShopOrders(sellerId, query);
  }

  @Get(':shopOrderId')
  @UseGuards(JwtAuthGuard, SellerOrAdminRoleGuard)
  getShopOrder(@Req() req: Request, @Param('shopOrderId') shopOrderId: string) {
    const sellerId = getUserId(req);
    if (!sellerId) throw new BadRequestException('x-user-id header is required.');
    parseUUID(sellerId, 'x-user-id');
    parseUUID(shopOrderId, 'shopOrderId');
    return this.ordersService.getSellerShopOrder(sellerId, shopOrderId);
  }

  @Patch(':shopOrderId/confirm')
  @UseGuards(JwtAuthGuard, SellerOrAdminRoleGuard)
  confirmShopOrder(@Req() req: Request, @Param('shopOrderId') shopOrderId: string) {
    const sellerId = getUserId(req);
    if (!sellerId) throw new BadRequestException('x-user-id header is required.');
    parseUUID(sellerId, 'x-user-id');
    parseUUID(shopOrderId, 'shopOrderId');
    return this.ordersService.confirmSellerShopOrder(sellerId, shopOrderId);
  }

  @Patch(':shopOrderId/ship')
  @UseGuards(JwtAuthGuard, SellerOrAdminRoleGuard)
  shipShopOrder(
    @Req() req: Request,
    @Param('shopOrderId') shopOrderId: string,
    @Body() dto: ShipOrderDto,
  ) {
    const sellerId = getUserId(req);
    if (!sellerId) throw new BadRequestException('x-user-id header is required.');
    parseUUID(sellerId, 'x-user-id');
    parseUUID(shopOrderId, 'shopOrderId');
    return this.ordersService.shipSellerShopOrder(sellerId, shopOrderId, dto);
  }

  @Patch(':shopOrderId/deliver')
  @UseGuards(JwtAuthGuard, SellerOrAdminRoleGuard)
  deliverShopOrder(@Req() req: Request, @Param('shopOrderId') shopOrderId: string) {
    const sellerId = getUserId(req);
    if (!sellerId) throw new BadRequestException('x-user-id header is required.');
    parseUUID(sellerId, 'x-user-id');
    parseUUID(shopOrderId, 'shopOrderId');
    return this.ordersService.deliverSellerShopOrder(sellerId, shopOrderId);
  }

  @Patch(':shopOrderId/cancel')
  @UseGuards(JwtAuthGuard, SellerOrAdminRoleGuard)
  cancelShopOrder(
    @Req() req: Request,
    @Param('shopOrderId') shopOrderId: string,
    @Body() dto: CancelOrderDto,
  ) {
    const sellerId = getUserId(req);
    if (!sellerId) throw new BadRequestException('x-user-id header is required.');
    parseUUID(sellerId, 'x-user-id');
    parseUUID(shopOrderId, 'shopOrderId');
    return this.ordersService.cancelSellerShopOrder(sellerId, shopOrderId, dto);
  }
}

// ─── Admin Order APIs ───────────────────────────────────────────────────────

@Controller('api/v1/admin/orders')
export class AdminOrderController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  listOrders(@Query() query: AdminOrderQueryDto) {
    return this.ordersService.listAdminOrders(query);
  }

  @Get(':orderId')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  getOrder(@Param('orderId') orderId: string) {
    parseUUID(orderId, 'orderId');
    return this.ordersService.getAdminOrder(orderId);
  }
}

@Controller('api/v1/admin/shop-orders')
export class AdminShopOrderController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  listShopOrders(@Query() query: AdminShopOrderQueryDto) {
    return this.ordersService.listAdminShopOrders(query);
  }

  @Get(':shopOrderId')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  getShopOrder(@Param('shopOrderId') shopOrderId: string) {
    parseUUID(shopOrderId, 'shopOrderId');
    return this.ordersService.getAdminShopOrder(shopOrderId);
  }

  @Patch(':shopOrderId/status')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  updateShopOrderStatus(
    @Param('shopOrderId') shopOrderId: string,
    @Body() dto: AdminUpdateShopOrderStatusDto,
  ) {
    parseUUID(shopOrderId, 'shopOrderId');
    return this.ordersService.updateAdminShopOrderStatus(shopOrderId, dto);
  }
}
