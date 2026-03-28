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
          type: 'postgres' as const,
          host: configService.getOrThrow<string>('DB_HOST'),
          port: Number(configService.getOrThrow<string>('DB_PORT')),
          username: configService.getOrThrow<string>('DB_USERNAME'),
          password: configService.getOrThrow<string>('DB_PASSWORD'),
          database: configService.getOrThrow<string>('DB_DATABASE'),
          autoLoadEntities: true,
          synchronize: false,
          dropSchema: false,
          migrationsRun: false,
          ssl:
            configService.get<string>('DB_SSL') === 'false'
              ? false
              : { rejectUnauthorized: false },
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
