import { Module } from '@nestjs/common';
import { MAIN_DATABASE_PROVIDERS } from './main-database-connection';
import { ConfigModule } from '../../shared/config/config.module';

@Module({
  providers: [
    ...MAIN_DATABASE_PROVIDERS,
  ],
  imports: [ConfigModule],
  exports: [],
})
export class MainDatabaseModule {}
