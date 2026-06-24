import { Module } from '@nestjs/common';
import { AnamnesisFieldController } from './anamnesis-field.controller';
import { MainDatabaseModule } from '../../database/main/main-database.module';
import { AnamnesisFieldService } from './anamnesis-field.service';

@Module({
  imports: [MainDatabaseModule],
  controllers: [AnamnesisFieldController],
  providers: [AnamnesisFieldService],
})
export class AnamnesisFieldModule {}
