import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthValidationService } from './auth-validation.service';
import { MainDatabaseModule } from '../database/main/main-database.module';

@Module({
  imports: [MainDatabaseModule],
  providers: [AuthService, AuthValidationService],
  exports: [AuthService, AuthValidationService],
})
@Global()
export class AuthModule {}
