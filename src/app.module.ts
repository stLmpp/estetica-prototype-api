import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import {
  MainDatabaseClsTransactional,
  MainDatabaseModule,
} from './database/main/main-database.module';
import { HealthModule } from './features/health/health.module';
import { LoggerModule } from './shared/logger/logger.module';
import { ConfigModule } from './shared/config/config.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppConfig } from './shared/config/app-config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth/auth';
import { GracefulShutdownModule } from '@tygra/nestjs-graceful-shutdown';
import { CustomerModule } from './features/customer/customer.module';
import { AllExceptionsFilter } from './core/filter/all-exception.filter';
import { createZodValidationPipe } from 'nestjs-zod';
import { CustomZodSerializerInterceptor } from './core/interceptor/custom-zod-serializer-interceptor';
import { ClsModule } from 'nestjs-cls';
import { SessionInterceptor } from './core/interceptor/session.interceptor';
import { AnamnesisFieldModule } from './features/anamnesis-field/anamnesis-field.module';

@Module({
  imports: [
    // Core
    ScheduleModule.forRoot(),
    ConfigModule,
    MainDatabaseModule,
    LoggerModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [AppConfig],
      useFactory: (config: AppConfig) => ({
        throttlers: [
          {
            ttl: config.throttlerTtlMs,
            limit: config.throttlerLimit,
          },
        ],
      }),
    }),
    AuthModule.forRoot({
      auth,
      bodyParser: {
        json: {
          limit: '2mb',
        },
        urlencoded: {
          enabled: true,
          extended: true,
          limit: '2mb',
        },
        rawBody: true,
      },
    }),
    GracefulShutdownModule.forRoot(),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
      },
      plugins: [
        MainDatabaseClsTransactional,
      ],
    }),

    // Features
    HealthModule,
    CustomerModule,
    AnamnesisFieldModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_PIPE,
      useClass: createZodValidationPipe({
        strictSchemaDeclaration: true,
      }),
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CustomZodSerializerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SessionInterceptor,
    },
  ],
})
export class AppModule {}
