import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class SellerOrAdminRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const role = (request as any).user?.role ?? request.headers['x-user-role'];
    if (role !== 'seller' && role !== 'admin') {
      throw new ForbiddenException('Seller or admin access required.');
    }
    return true;
  }
}
