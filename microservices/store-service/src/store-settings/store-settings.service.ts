import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateStoreSettingsDto } from './dto/update-store-settings.dto';
import { StoreSettingsEntity } from './entities/store-settings.entity';

@Injectable()
export class StoreSettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(StoreSettingsEntity)
    private readonly storeSettingsRepository: Repository<StoreSettingsEntity>,
  ) {}

  async onModuleInit() {
    await this.getSettings();
  }

  async getSettings() {
    const existing = await this.storeSettingsRepository.findOne({
      where: {},
      order: { createdAt: 'ASC' },
    });

    if (existing) {
      return existing;
    }

    return this.storeSettingsRepository.save(
      this.storeSettingsRepository.create({
        storeName: 'Advance Technology',
        logoImageUrl: null,
        logoPublicId: null,
        description: null,
        contactEmail: 'support@advancetechnology.local',
        contactPhone: '+84 000 000 000',
        address: 'Ho Chi Minh City, Vietnam',
      }),
    );
  }

  async updateSettings(dto: UpdateStoreSettingsDto) {
    const settings = await this.getSettings();
    Object.assign(settings, dto);
    return this.storeSettingsRepository.save(settings);
  }
}
