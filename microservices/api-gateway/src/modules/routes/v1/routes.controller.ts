import { All, Controller, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ProxyService } from '../../proxy/proxy.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../../auth/guards/admin-role.guard';

@Controller('api/v1/users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToUserService(@Req() req: Request, @Res() res: Response) {
     return this.proxyService.forwardRequest(req, res, this.configService.getOrThrow<string>('USER_SERVICE_URL'));
  }
}

@Controller('api/v1/products')
export class ProductController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToProductService(@Req() req: Request, @Res() res: Response) {
     return this.proxyService.forwardRequest(req, res, this.configService.getOrThrow<string>('PRODUCT_SERVICE_URL'));
  }
}

@Controller('api/v1/admin/products')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminProductController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToProductService(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('PRODUCT_SERVICE_URL'),
    );
  }
}

@Controller('api/v1/orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToOrderService(@Req() req: Request, @Res() res: Response) {
     return this.proxyService.forwardRequest(req, res, this.configService.getOrThrow<string>('ORDER_SERVICE_URL'));
  }
}

@Controller('api/v1/carts')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToCartService(@Req() req: Request, @Res() res: Response) {
     return this.proxyService.forwardRequest(req, res, this.configService.getOrThrow<string>('CART_SERVICE_URL'));
  }
}

@Controller('api/v1/inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToInventoryService(@Req() req: Request, @Res() res: Response) {
     return this.proxyService.forwardRequest(req, res, this.configService.getOrThrow<string>('INVENTORY_SERVICE_URL'));
  }
}

@Controller('api/v1/admin/inventory')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminInventoryController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToInventoryService(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('INVENTORY_SERVICE_URL'),
    );
  }
}

@Controller('api/v1/payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToPaymentService(@Req() req: Request, @Res() res: Response) {
     return this.proxyService.forwardRequest(req, res, this.configService.getOrThrow<string>('PAYMENT_SERVICE_URL'));
  }
}

@Controller('api/v1/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToNotificationService(@Req() req: Request, @Res() res: Response) {
     return this.proxyService.forwardRequest(req, res, this.configService.getOrThrow<string>('NOTIFICATION_SERVICE_URL'));
  }
}
