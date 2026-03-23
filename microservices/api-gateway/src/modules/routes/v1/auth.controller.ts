import { All, Controller, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly configService: ConfigService) {}

  @All(['', '/*'])
  async forwardToAuthService(@Req() req: Request, @Res() res: Response) {
    const targetUrl = new URL(
      req.originalUrl,
      this.configService.getOrThrow<string>('AUTH_SERVICE_URL'),
    );

    const headers = new Headers();
    const authorization = req.header('authorization');
    if (authorization) {
      headers.set('authorization', authorization);
    }

    const hasJsonBody =
      !['GET', 'HEAD'].includes(req.method) &&
      req.body &&
      Object.keys(req.body).length > 0;

    if (hasJsonBody) {
      headers.set('content-type', 'application/json');
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: hasJsonBody ? JSON.stringify(req.body) : undefined,
    });

    res.status(response.status);

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return res.json(await response.json());
    }

    return res.send(await response.text());
  }
}
