import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AdminLogQueryDto } from './dto/admin-log-query.dto';
import { CreateLogEntryDto } from './dto/create-log-entry.dto';
import { LoggingService } from './logging.service';

@Controller('api/v1/logs')
export class LoggingController {
  constructor(private readonly loggingService: LoggingService) {}

  @Post()
  create(@Body() dto: CreateLogEntryDto) {
    return this.loggingService.create(dto);
  }
}

@Controller('api/v1/admin/logs')
export class AdminLoggingController {
  constructor(private readonly loggingService: LoggingService) {}

  @Get()
  search(@Query() query: AdminLogQueryDto) {
    return this.loggingService.search(query);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.loggingService.getById(id);
  }
}
