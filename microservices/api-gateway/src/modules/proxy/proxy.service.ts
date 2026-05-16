import { Injectable, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private readonly downstreamTimeoutMs = 600000;

  /**
   * Forwards an incoming HTTP request to a target downstream service URL
   * using native fetch() instead of http-proxy-middleware.
   * This guarantees the request body is always forwarded correctly.
   */
  async forwardRequest(req: Request, res: Response, targetUrl: string): Promise<void> {
    const url = `${targetUrl}${req.originalUrl}`;
    this.logger.debug(`Forwarding ${req.method} to: ${url}`);

    const headers: Record<string, string> = {
      'Content-Type': req.headers['content-type'] || 'application/json',
    };

    // Forward incoming auth headers (for mock auth support)
    if (req.headers['x-user-id']) {
      headers['x-user-id'] = req.headers['x-user-id'] as string;
    }
    if (req.headers['x-user-role']) {
      headers['x-user-role'] = req.headers['x-user-role'] as string;
    }

    // Forward auth headers injected by guards (JWT)
    const user = (req as any).user;
    if (user?.userId) {
      headers['x-user-id'] = user.userId;
      headers['x-user-role'] = user.role || '';
    }

    // Forward authorization header if present
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    try {
      const isMultipart = String(req.headers['content-type'] ?? '').startsWith('multipart/form-data');
      const hasBody = req.method !== 'GET' && req.method !== 'HEAD' && req.body && Object.keys(req.body).length > 0;

      const fetchOptions: RequestInit = {
        method: req.method,
        headers,
        signal: AbortSignal.timeout(this.downstreamTimeoutMs),
      };

      if (isMultipart && req.method !== 'GET' && req.method !== 'HEAD') {
        fetchOptions.body = req as any;
        (fetchOptions as any).duplex = 'half';
      } else if (hasBody) {
        fetchOptions.body = JSON.stringify(req.body);
        this.logger.debug(`Request body: ${fetchOptions.body}`);
      }

      const response = await fetch(url, fetchOptions);

      // Forward status code
      res.status(response.status);

      // Forward response headers
      response.headers.forEach((value, key) => {
        // Skip hop-by-hop headers
        if (!['transfer-encoding', 'connection', 'keep-alive'].includes(key.toLowerCase())) {
          res.setHeader(key, value);
        }
      });

      // Forward response body
      const responseBody = await response.text();
      res.send(responseBody);
    } catch (error: any) {
      this.logger.error(`Proxy Error: ${error.message}`, error.stack);
      if (!res.headersSent) {
        const isTimeout = error.name === 'TimeoutError' || error.code === 'ETIMEDOUT';
        const statusCode = isTimeout ? 504 : 502;
        const message = isTimeout
          ? 'Gateway Timeout. Downstream service did not respond in time.'
          : 'Bad Gateway. Downstream service is unavailable.';

        res.status(statusCode).json({ statusCode, message, error: error.message });
      }
    }
  }
}
