import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = (request as any).user?.userId ?? request.headers['x-user-id'];
    if (!userId) {
      throw new UnauthorizedException('Authentication required.');
    }
    return true;
  }
}
