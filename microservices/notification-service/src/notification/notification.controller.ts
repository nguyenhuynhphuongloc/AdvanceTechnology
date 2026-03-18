import { Controller, Get } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('api/v1/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('logs')
  getLogs() {
    return this.notificationService.getLogs();
  }
}
