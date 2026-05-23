import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MainDatabaseModule } from './database/main/main-database.module';
import { HealthModule } from './features/health/health.module';
import { LoggerModule } from './shared/logger/logger.module';
import { ConfigModule } from './shared/config/config.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppConfig } from './shared/config/app-config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth/auth';
import { GracefulShutdownModule } from '@tygra/nestjs-graceful-shutdown';
import { CustomerModule } from './features/customer/customer.module';
import { AllExceptionsFilter } from './core/filter/all-exception.filter';
import { ResponseValidationInterceptor } from './core/interceptor/response-validation.interceptor';

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

    // Features
    HealthModule,
    CustomerModule,
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
      provide: APP_INTERCEPTOR,
      useClass: ResponseValidationInterceptor,
    },
  ],
})
export class AppModule {}
