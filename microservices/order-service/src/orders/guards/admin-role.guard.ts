import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const role = (request as any).user?.role ?? request.headers['x-user-role'];
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required.');
    }
    return true;
  }
}
