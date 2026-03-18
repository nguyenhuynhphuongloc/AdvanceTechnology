import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { AuthModule } from './modules/auth/auth.module';
import { RoutesModule } from './modules/routes/routes.module';

@Module({
  imports: [
    AppConfigModule,
    AuthModule,
    RoutesModule,
  ],
})
export class AppModule {}
