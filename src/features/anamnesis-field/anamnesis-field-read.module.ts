import { Module } from '@nestjs/common';
import { MainDatabaseModule } from '../../database/main/main-database.module';
import { AnamnesisFieldReadService } from './anamnesis-field-read.service';

@Module({
  imports: [MainDatabaseModule],
  providers: [AnamnesisFieldReadService],
  exports: [AnamnesisFieldReadService],
})
export class AnamnesisFieldReadModule {}
