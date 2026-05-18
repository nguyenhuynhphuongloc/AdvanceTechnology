import {
  All,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ProxyService } from '../../proxy/proxy.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../../auth/guards/admin-role.guard';
import { SellerOrAdminRoleGuard } from '../../auth/guards/seller-or-admin-role.guard';
import { OptionalJwtAuthGuard } from '../../auth/guards/optional-jwt-auth.guard';

// ─── Auth ─────────────────────────────────────────────────────────────────────

@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToAuthService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('AUTH_SERVICE_URL'),
    );
  }
}

// ─── Users ────────────────────────────────────────────────────────────────────

@Controller('api/v1/users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToUserService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('USER_SERVICE_URL'),
    );
  }
}

// ─── Seller Profile ────────────────────────────────────────────────────────────

@Controller('api/v1/seller/me/profile')
@UseGuards(JwtAuthGuard, SellerOrAdminRoleGuard)
export class SellerController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToUserService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('USER_SERVICE_URL'),
    );
  }
}

// ─── Seller Shop ───────────────────────────────────────────────────────────────

@Controller('api/v1/seller/shop')
@UseGuards(JwtAuthGuard, SellerOrAdminRoleGuard)
export class SellerShopController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToStoreService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('STORE_SERVICE_URL'),
    );
  }
}

// ─── Shops (Public) ────────────────────────────────────────────────────────────

@Controller('api/v1/shops')
export class PublicShopsController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToStoreService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('STORE_SERVICE_URL'),
    );
  }
}

// ─── Products ────────────────────────────────────────────────────────────────

@Controller('api/v1/products')
export class ProductController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @Post('upload-image')
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  forwardProtectedProductImageUpload(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('PRODUCT_SERVICE_URL'),
    );
  }

  @All(['', '/*'])
  forwardToProductService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('PRODUCT_SERVICE_URL'),
    );
  }
}

// ─── Categories ──────────────────────────────────────────────────────────────

@Controller('api/v1/categories')
export class CategoryController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToProductService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('PRODUCT_SERVICE_URL'),
    );
  }
}

// ─── Admin Products ───────────────────────────────────────────────────────────

@Controller('api/v1/admin/products')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminProductController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToProductService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('PRODUCT_SERVICE_URL'),
    );
  }
}

// ─── Admin Categories ─────────────────────────────────────────────────────────

@Controller('api/v1/admin/categories')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminCategoryController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToProductService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('PRODUCT_SERVICE_URL'),
    );
  }
}

// ─── Admin Orders ─────────────────────────────────────────────────────────────

@Controller('api/v1/admin/orders')
@UseGuards(OptionalJwtAuthGuard, SellerOrAdminRoleGuard)
export class AdminOrderController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToOrderService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('ORDER_SERVICE_URL'),
    );
  }
}

// ─── Orders ──────────────────────────────────────────────────────────────────

@Controller('api/v1/orders')
@UseGuards(OptionalJwtAuthGuard)
export class OrderController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToOrderService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('ORDER_SERVICE_URL'),
    );
  }
}

// ─── Carts ───────────────────────────────────────────────────────────────────

@Controller('api/v1/carts')
@UseGuards(OptionalJwtAuthGuard)
export class CartController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToCartService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('CART_SERVICE_URL'),
    );
  }
}

// ─── Inventory ───────────────────────────────────────────────────────────────

@Controller('api/v1/inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToInventoryService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('INVENTORY_SERVICE_URL'),
    );
  }
}

// ─── Admin Inventory ─────────────────────────────────────────────────────────

@Controller('api/v1/admin/inventory')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminInventoryController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToInventoryService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('INVENTORY_SERVICE_URL'),
    );
  }
}

// ─── Admin Branches ──────────────────────────────────────────────────────────

@Controller('api/v1/admin/branches')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminBranchController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToInventoryService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('INVENTORY_SERVICE_URL'),
    );
  }
}

// ─── Admin Users ─────────────────────────────────────────────────────────────

@Controller('api/v1/admin/users')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminUserController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToAuthService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('AUTH_SERVICE_URL'),
    );
  }
}

// ─── Admin Seller Profiles ────────────────────────────────────────────────────

@Controller('api/v1/admin/seller-profiles')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminSellerProfilesController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToUserService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('USER_SERVICE_URL'),
    );
  }
}

// ─── Payments ───────────────────────────────────────────────────────────────

@Controller('api/v1/payments')
@UseGuards(OptionalJwtAuthGuard)
export class PaymentController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToPaymentService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('PAYMENT_SERVICE_URL'),
    );
  }
}

// ─── Admin Payments ───────────────────────────────────────────────────────────

@Controller('api/v1/admin/payments')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminPaymentController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToPaymentService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('PAYMENT_SERVICE_URL'),
    );
  }
}

// ─── Notifications ────────────────────────────────────────────────────────────

@Controller('api/v1/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToNotificationService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('NOTIFICATION_SERVICE_URL'),
    );
  }
}

// ─── Admin Notifications ─────────────────────────────────────────────────────

@Controller('api/v1/admin/notifications')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminNotificationController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToNotificationService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('NOTIFICATION_SERVICE_URL'),
    );
  }
}

// ─── Admin Carts ──────────────────────────────────────────────────────────────

@Controller('api/v1/admin/carts')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminCartController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToCartService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('CART_SERVICE_URL'),
    );
  }
}

// ─── Admin Store Settings ───────────────────────────────────────────────────

@Controller('api/v1/admin/store-settings')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminStoreSettingsController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToStoreService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('STORE_SERVICE_URL'),
    );
  }
}

// ─── Store Settings (Public) ─────────────────────────────────────────────────

@Controller('api/v1/store-settings')
export class StoreSettingsController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToStoreService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('STORE_SERVICE_URL'),
    );
  }
}

// ─── Admin Shops ─────────────────────────────────────────────────────────────

@Controller('api/v1/admin/shops')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminShopsController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToStoreService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('STORE_SERVICE_URL'),
    );
  }
}

// ─── Seller Products ───────────────────────────────────────────────────────────

@Controller('api/v1/seller/products')
@UseGuards(JwtAuthGuard, SellerOrAdminRoleGuard)
export class SellerProductsProxyController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToProductService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('PRODUCT_SERVICE_URL'),
    );
  }
}

// ─── Admin Product Moderation ─────────────────────────────────────────────────

@Controller('api/v1/admin/products/moderation')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminProductModerationProxyController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToProductService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('PRODUCT_SERVICE_URL'),
    );
  }
}

// ─── Shop Products (Public) ────────────────────────────────────────────────────

@Controller('api/v1/shops/:slug/products')
export class ShopProductsProxyController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  forwardToProductService(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('PRODUCT_SERVICE_URL'),
    );
  }
}

// ─── Seller Inventory ─────────────────────────────────────────────────────────

@Controller('api/v1/seller/inventory')
@UseGuards(JwtAuthGuard, SellerOrAdminRoleGuard)
export class SellerInventoryProxyController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToInventoryService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('INVENTORY_SERVICE_URL'),
    );
  }
}

// ─── Seller Categories ────────────────────────────────────────────────────────

@Controller('api/v1/seller/categories')
@UseGuards(JwtAuthGuard, SellerOrAdminRoleGuard)
export class SellerCategoryProxyController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToStoreService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('STORE_SERVICE_URL'),
    );
  }
}

// ─── Seller Orders ──────────────────────────────────────────────────────────────

@Controller('api/v1/seller/orders')
@UseGuards(JwtAuthGuard, SellerOrAdminRoleGuard)
export class SellerOrderProxyController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToOrderService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('ORDER_SERVICE_URL'),
    );
  }
}

// ─── Admin Shop Orders ─────────────────────────────────────────────────────────

@Controller('api/v1/admin/shop-orders')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminShopOrderProxyController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToOrderService(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _body: any,
  ) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('ORDER_SERVICE_URL'),
    );
  }
}

// ─── AI ──────────────────────────────────────────────────────────────────────

@Controller('api/v1/ai')
export class AIController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToAIAgentService(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.forwardRequest(
      req,
      res,
      this.configService.getOrThrow<string>('AI_AGENT_SERVICE_URL'),
    );
  }
}
