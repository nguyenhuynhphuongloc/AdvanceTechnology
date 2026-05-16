import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminStoreSettingsController, StoreSettingsController } from './store-settings.controller';
import { StoreSettingsEntity } from './entities/store-settings.entity';
import { StoreSettingsService } from './store-settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([StoreSettingsEntity])],
  controllers: [StoreSettingsController, AdminStoreSettingsController],
  providers: [StoreSettingsService],
})
export class StoreSettingsModule {}
