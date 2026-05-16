import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminLogQueryDto } from './dto/admin-log-query.dto';
import { CreateLogEntryDto } from './dto/create-log-entry.dto';
import { LogEntryEntity } from './entities/log-entry.entity';

@Injectable()
export class LoggingService implements OnModuleInit {
  constructor(
    @InjectRepository(LogEntryEntity)
    private readonly logRepository: Repository<LogEntryEntity>,
  ) {}

  async onModuleInit() {
    const count = await this.logRepository.count();
    if (count > 0) {
      return;
    }

    await this.logRepository.save(
      this.logRepository.create({
        level: 'info',
        source: 'logging-service',
        message: 'Logging service initialized.',
        metadata: null,
      }),
    );
  }

  async create(dto: CreateLogEntryDto) {
    return this.logRepository.save(
      this.logRepository.create({
        ...dto,
        metadata: dto.metadata ?? null,
      }),
    );
  }

  async search(query: AdminLogQueryDto) {
    const qb = this.logRepository.createQueryBuilder('log');

    if (query.level) {
      qb.andWhere('log.level = :level', { level: query.level });
    }

    if (query.source) {
      qb.andWhere('log.source = :source', { source: query.source });
    }

    if (query.search) {
      qb.andWhere('(log.message ILIKE :search OR log.source ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    const items = await qb.orderBy('log.createdAt', 'DESC').getMany();
    return {
      items,
      total: items.length,
    };
  }

  async getById(id: string) {
    return this.logRepository.findOne({ where: { id } });
  }
}
