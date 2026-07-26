import { Module } from '@nestjs/common';
import { ConfigController } from './config.controller';
import { MainDatabaseModule } from '../../database/main/main-database.module';
import { RedisModule } from '../../core/redis/redis.module';
import { ConfigService } from './config.service';

@Module({
  imports: [MainDatabaseModule, RedisModule],
  controllers: [ConfigController],
  providers: [ConfigService],
})
export class ConfigModule {}
