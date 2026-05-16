import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuyerProfile } from './entities/buyer-profile.entity';
import { SellerProfile } from './entities/seller-profile.entity';
import { Address } from './entities/address.entity';
import { UsersController } from './users.controller';
import { SellerController } from './users.controller';
import { AdminSellerProfilesController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([BuyerProfile, SellerProfile, Address])],
  controllers: [UsersController, SellerController, AdminSellerProfilesController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
