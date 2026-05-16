import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminLoggingController, LoggingController } from './logging.controller';
import { LogEntryEntity } from './entities/log-entry.entity';
import { LoggingService } from './logging.service';

@Module({
  imports: [TypeOrmModule.forFeature([LogEntryEntity])],
  controllers: [LoggingController, AdminLoggingController],
  providers: [LoggingService],
})
export class LoggingModule {}
