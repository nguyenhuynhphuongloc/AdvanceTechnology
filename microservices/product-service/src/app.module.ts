import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfigModule } from './config/app-config.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isTest = configService.get<string>('NODE_ENV') === 'test';

        if (isTest) {
          return {
            type: 'sqljs' as const,
            autoLoadEntities: true,
            synchronize: true,
          };
        }

        return {
          type: 'mongodb' as const,
          url: configService.getOrThrow<string>('DB_URL'),
          useNewUrlParser: true,
          useUnifiedTopology: true,
          autoLoadEntities: true,
          synchronize: true, // MongoDB allows synchronize in production safely usually, but let's keep it true for development ease
        };
      },
      inject: [ConfigService],
    }),
    ProductModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
