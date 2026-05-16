import { Body, Controller, Get, Patch } from '@nestjs/common';
import { UpdateStoreSettingsDto } from './dto/update-store-settings.dto';
import { StoreSettingsService } from './store-settings.service';

@Controller('api/v1/store-settings')
export class StoreSettingsController {
  constructor(private readonly storeSettingsService: StoreSettingsService) {}

  @Get()
  getSettings() {
    return this.storeSettingsService.getSettings();
  }
}

@Controller('api/v1/admin/store-settings')
export class AdminStoreSettingsController {
  constructor(private readonly storeSettingsService: StoreSettingsService) {}

  @Get()
  getSettings() {
    return this.storeSettingsService.getSettings();
  }

  @Patch()
  updateSettings(@Body() dto: UpdateStoreSettingsDto) {
    return this.storeSettingsService.updateSettings(dto);
  }
}
