import { Module } from '@nestjs/common';
import { ConfigController } from './config.controller';
import { MainDatabaseModule } from '../../database/main/main-database.module';
import { RedisModule } from '../../core/redis/redis.module';
import { ConfigService } from './config.service';
import { EnvironmentModule } from '../../core/config/environment.module';

@Module({
  imports: [MainDatabaseModule, RedisModule, EnvironmentModule],
  controllers: [ConfigController],
  providers: [ConfigService],
})
export class ConfigModule {}
