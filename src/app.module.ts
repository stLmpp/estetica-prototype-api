import { Module, ModuleMetadata, OnModuleInit } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import {
  MainDatabaseClsTransactional,
  MainDatabaseModule,
} from './database/main/main-database.module';
import { HealthModule } from './features/health/health.module';
import { LoggerModule } from './core/logger/logger.module';
import { EnvironmentModule } from './core/config/environment.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppEnv } from './core/config/app-env';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import {
  AuthGuard as BaseAuthGuard,
  AuthModule as BetterAuthModule,
} from '@thallesp/nestjs-better-auth';
import { auth } from './core/auth/auth';
import { GracefulShutdownModule } from '@tygra/nestjs-graceful-shutdown';
import { CustomerModule } from './features/customer/customer.module';
import { AllExceptionsFilter } from './core/filter/all-exception.filter';
import { CustomZodSerializerInterceptor } from './core/interceptor/custom-zod-serializer-interceptor';
import { ClsModule } from 'nestjs-cls';
import { AnamnesisFieldModule } from './features/anamnesis-field/anamnesis-field.module';
import { CustomerAnamnesisModule } from './features/customer-anamnesis/customer-anamnesis.module';
import { safeAsync } from './shared/utils/safe';
import { isAPIError } from 'better-auth/api';
import { LoggerService } from './core/logger/logger.service';
import { AuthModule } from './core/auth/auth.module';
import { AuthService } from './core/auth/auth.service';
import { LoggingInterceptor } from './core/interceptor/logging.interceptor';
import { ErrorAfterHook } from './core/auth/error-after-hook';
import { Environment } from './shared/environment.enum';
import { ConfigModule } from './features/config/config.module';
import { ResponseErrorModel } from './shared/model/response-error.model';
import { ZodValidationPipe } from '@stlmpp/nestjs-zod';
import { CatalogItemModule } from './features/catalog-item/catalog-item.module';
import { EmployeeModule } from './features/employee/employee.module';
import { EmployeeServiceModule } from './features/employee-service/employee-service.module';
import { AppointmentModule } from './features/appointment/appointment.module';
import { SaleModule } from './features/sale/sale.module';
import { AuthGuard } from './core/auth/auth.guard';
import { HasPermissionGuard } from './core/auth/has-permission.guard';
import { RedisModule } from './core/redis/redis.module';
import { RedisThrottlerStorage } from '@nestjs-redis/throttler-storage';
import { Redis } from '@upstash/redis';
import { ThrottlerRedisClient } from './core/redis/throttler-redis-client';

const appEnv = AppEnv.instance;

const CORE_MODULES: ModuleMetadata['imports'] = [
  ScheduleModule.forRoot(),
  EnvironmentModule,
  MainDatabaseModule,
  LoggerModule,
  ThrottlerModule.forRootAsync({
    imports: [EnvironmentModule, RedisModule],
    inject: [AppEnv, Redis],
    useFactory: (appEnv: AppEnv, redis: Redis) => ({
      throttlers: [
        {
          ttl: appEnv.throttlerTtlMs,
          limit: appEnv.throttlerLimit,
        },
      ],
      storage: new RedisThrottlerStorage(new ThrottlerRedisClient(redis)),
    }),
  }),
  BetterAuthModule.forRoot({
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
    disableGlobalAuthGuard: true,
  }),
  ClsModule.forRoot({
    global: true,
    middleware: {
      mount: true,
    },
    plugins: [
      MainDatabaseClsTransactional,
    ],
  }),
  AuthModule,
];

if (appEnv.environment === Environment.Production) {
  CORE_MODULES.push(GracefulShutdownModule.forRoot());
}

@Module({
  imports: [
    // Core
    ...CORE_MODULES,

    // Features
    HealthModule,
    CustomerModule,
    AnamnesisFieldModule,
    CustomerAnamnesisModule,
    ConfigModule,
    CatalogItemModule,
    EmployeeModule,
    EmployeeServiceModule,
    AppointmentModule,
    SaleModule,
  ],
  providers: [
    ErrorAfterHook,
    BaseAuthGuard,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: HasPermissionGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: CustomZodSerializerInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
class AppModule implements OnModuleInit {
  constructor(
    private readonly appEnv: AppEnv,
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
  ) {
    logger.setContext(AppModule.name);
  }

  private readonly USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL =
    'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL';

  async onModuleInit() {
    const [error] = await safeAsync(() =>
      this.authService.api.createUser({
        body: {
          email: this.appEnv.betterAuthAdminEmail,
          name: this.appEnv.betterAuthAdminName,
          password: this.appEnv.betterAuthAdminPassword,
          role: 'admin',
        },
      }),
    );
    await safeAsync(() =>
      this.authService.api.createUser({
        body: {
          email: this.appEnv.betterAuthUserEmail,
          name: this.appEnv.betterAuthUserEmail,
          password: this.appEnv.betterAuthUserPassword,
          role: 'user',
        },
      }),
    );
    const code = isAPIError(error)
      ? ResponseErrorModel.is(error.body)
        ? error.body.error.code
        : error.body?.code
      : null;
    if (!error || code === this.USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL) {
      return;
    }
    this.logger.error('Failed to create admin user', { error });
  }
}

export default AppModule;
