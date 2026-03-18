import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '../redis/redis.module';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartState } from './entities/cart-state.entity';

@Module({
  imports: [RedisModule, TypeOrmModule.forFeature([CartState])],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
