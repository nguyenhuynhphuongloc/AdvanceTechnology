import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class SellerOrAdminRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<any>();
    
    // Check both req.user (from JWT) and x-user-role header (from Mock Auth)
    const userRole = request.user?.role || request.headers['x-user-role'];
    
    if (userRole !== 'admin' && userRole !== 'seller') {
      throw new ForbiddenException('Admin or Seller role is required.');
    }

    return true;
  }
}
