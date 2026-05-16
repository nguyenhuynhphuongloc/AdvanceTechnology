import { Module } from '@nestjs/common';
import { AuthController } from './v1/auth.controller';
import { 
  UserController, 
  ProductController, 
  CategoryController,
  AdminProductController,
  AdminCategoryController,
  AdminOrderController,
  AdminBranchController,
  AdminCartController,
  AdminLogController,
  AdminNotificationController,
  AdminPaymentController,
  AdminStoreSettingsController,
  OrderController, 
  CartController, 
  InventoryController, 
  AdminInventoryController,
  AdminUserController,
  PaymentController, 
  NotificationController,
  StoreSettingsController,
  AIController 
} from './v1/routes.controller';
import { ProxyModule } from '../proxy/proxy.module';

@Module({
  imports: [ProxyModule],
  controllers: [
    AuthController,
    UserController,
    ProductController,
    CategoryController,
    AdminProductController,
    AdminCategoryController,
    AdminOrderController,
    AdminBranchController,
    AdminCartController,
    OrderController,
    CartController,
    InventoryController,
    AdminInventoryController,
    AdminUserController,
    AdminLogController,
    AdminNotificationController,
    AdminPaymentController,
    AdminStoreSettingsController,
    PaymentController,
    NotificationController,
    StoreSettingsController,
    AIController
  ],
})
export class RoutesModule {}
