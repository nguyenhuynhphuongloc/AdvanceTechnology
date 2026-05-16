import { Controller, Get, Param, Query } from '@nestjs/common';
import { AdminNotificationQueryDto } from './dto/admin-notification-query.dto';
import { NotificationService } from './notification.service';

@Controller('api/v1/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('logs')
  getLogs() {
    return this.notificationService.getLogs();
  }
}

@Controller('api/v1/admin/notifications')
export class AdminNotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  getLogs(@Query() query: AdminNotificationQueryDto) {
    return this.notificationService.searchLogs(query);
  }

  @Get(':id')
  getLogById(@Param('id') id: string) {
    return this.notificationService.getLogById(id);
  }
}
