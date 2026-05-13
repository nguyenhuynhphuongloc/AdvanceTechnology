import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override handleRequest to always return the user object (if found) or null,
  // instead of throwing an UnauthorizedException.
  handleRequest(err, user, info) {
    return user || null;
  }
}
