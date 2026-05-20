import { Module } from '@nestjs/common';
import { AppConfig } from './app-config';

@Module({
  providers: [
    {
      provide: AppConfig,
      useValue: AppConfig.instance,
    },
  ],
  exports: [AppConfig],
})
export class ConfigModule {}
