import { Module } from '@nestjs/common';
import { AppEnv } from './app-env';

@Module({
  providers: [
    {
      provide: AppEnv,
      useValue: AppEnv.instance,
    },
  ],
  exports: [AppEnv],
})
export class EnvironmentModule {}
