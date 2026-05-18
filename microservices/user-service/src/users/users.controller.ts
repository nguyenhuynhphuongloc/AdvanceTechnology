import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { UpdateBuyerProfileDto, CreateAddressDto, UpdateAddressDto } from './dto/user.dto';

function getUserId(req: Request): string {
  const userId = (req as any).user?.userId ?? req.headers['x-user-id'];
  if (!userId) {
    throw new Error('x-user-id header is required');
  }
  return userId as string;
}

@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me/profile')
  getMyProfile(@Req() req: Request) {
    return this.usersService.getBuyerProfile(getUserId(req));
  }

  @Patch('me/profile')
  updateMyProfile(@Req() req: Request, @Body() dto: UpdateBuyerProfileDto) {
    return this.usersService.updateBuyerProfile(getUserId(req), dto);
  }

  @Get('me/addresses')
  getMyAddresses(@Req() req: Request) {
    return this.usersService.getAddresses(getUserId(req));
  }

  @Post('me/addresses')
  createAddress(@Req() req: Request, @Body() dto: CreateAddressDto) {
    return this.usersService.createAddress(getUserId(req), dto);
  }

  @Patch('me/addresses/:id')
  updateAddress(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateAddressDto) {
    return this.usersService.updateAddress(getUserId(req), id, dto);
  }

  @Delete('me/addresses/:id')
  deleteAddress(@Req() req: Request, @Param('id') id: string) {
    return this.usersService.deleteAddress(getUserId(req), id);
  }
}

@Controller('api/v1/seller')
export class SellerController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me/profile')
  getMySellerProfile(@Req() req: Request) {
    return this.usersService.getSellerProfile(getUserId(req));
  }

  @Patch('me/profile')
  updateMySellerProfile(@Req() req: Request, @Body() dto: { businessName?: string; phone?: string }) {
    return this.usersService.updateSellerProfile(getUserId(req), dto);
  }
}

@Controller('api/v1/admin/seller-profiles')
export class AdminSellerProfilesController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  listSellerProfiles() {
    return this.usersService.listAllSellerProfiles();
  }

  @Get(':id')
  getSellerProfile(@Param('id') id: string) {
    return this.usersService.getSellerProfileById(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.usersService.adminUpdateSellerStatus(id, body.status as any);
  }
}
