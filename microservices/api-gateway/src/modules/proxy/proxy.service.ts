import { Injectable, Logger } from '@nestjs/common';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { Request, Response } from 'express';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private readonly downstreamTimeoutMs = 2000;

  /**
   * Forwards an incoming HTTP request to a target downstream service URL.
   * Injects the X-User-Id header if the user has been authenticated.
   * @param req The incoming Express Request
   * @param res The outgoing Express Response
   * @param targetUrl The downstream microservice URL
   */
  async forwardRequest(req: Request, res: Response, targetUrl: string): Promise<void> {
    this.logger.debug(`Forwarding request to: ${targetUrl}${req.originalUrl}`);

    const proxy = createProxyMiddleware({
      target: targetUrl,
      changeOrigin: true,
      proxyTimeout: this.downstreamTimeoutMs,
      on: {
        proxyReq: (proxyReq, req: any) => {
          // If JwtAuthGuard populated req.user, inject X-User-Id into the proxied request
          if (req.user && req.user.userId) {
            proxyReq.setHeader('X-User-Id', req.user.userId);
            proxyReq.setHeader('X-User-Role', req.user.role || '');
          }
        },
        error: (err, req, res: any) => {
          this.logger.error(`Proxy Error: ${err.message}`, err.stack);
          if (!res.headersSent) {
            const isTimeout = err.code === 'ETIMEDOUT' || err.code === 'ECONNRESET';
            const statusCode = isTimeout ? 504 : 502;
            const message = isTimeout
              ? 'Gateway Timeout. Downstream service did not respond in time.'
              : 'Bad Gateway. Downstream service is unavailable.';

             res.status(statusCode).json({
               statusCode,
               message,
               error: err.message
             });
          }
        }
      }
    });

    // Execute the proxy middleware
    proxy(req, res, () => {});
  }
}
