import { All, Controller, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ProxyService } from '../../proxy/proxy.service';

@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  @All(['', '/*'])
  forwardToAuthService(@Req() req: Request, @Res() res: Response) {
     return this.proxyService.forwardRequest(req, res, this.configService.getOrThrow<string>('AUTH_SERVICE_URL'));
  }
}
