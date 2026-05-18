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

        const sslEnabled =
          configService.get<string>('DB_SSL', 'false').trim().toLowerCase() === 'true';

        const mongoOptions: Record<string, unknown> = {};

        if (sslEnabled) {
          mongoOptions.tls = true;
          mongoOptions.tlsAllowInvalidCertificates = true;
          mongoOptions.tlsAllowInvalidHostnames = true;
        }

        return {
          type: 'mongodb' as const,
          url: configService.getOrThrow<string>('DB_URL'),
          autoLoadEntities: true,
          synchronize: configService.get<string>('TYPEORM_SYNCHRONIZE', 'false') === 'true',
          ...mongoOptions,
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
