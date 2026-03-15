import { Module } from '@nestjs/common';
import { AuthController } from './v1/auth.controller';
import { 
  UserController, 
  ProductController, 
  OrderController, 
  CartController, 
  InventoryController, 
  PaymentController, 
  NotificationController 
} from './v1/routes.controller';
import { ProxyModule } from '../proxy/proxy.module';

@Module({
  imports: [ProxyModule],
  controllers: [
    AuthController,
    UserController,
    ProductController,
    OrderController,
    CartController,
    InventoryController,
    PaymentController,
    NotificationController
  ],
})
export class RoutesModule {}
