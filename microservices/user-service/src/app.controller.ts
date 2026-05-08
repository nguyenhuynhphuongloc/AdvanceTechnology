import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): Promise<string> {
    this.logger.log('Handling GET / request');
    const result = this.appService.getHello();
    this.logger.log('Returning hello message');
    return result;
  }
}
