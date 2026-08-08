import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthValidationService } from './auth-validation.service';
import { MainDatabaseModule } from '../../database/main/main-database.module';
import { AuthDataService } from './auth-data.service';

@Module({
  imports: [MainDatabaseModule],
  providers: [
    AuthService,
    AuthValidationService,
    {
      provide: AuthDataService,
      useValue: AuthDataService.instance,
    },
  ],
  exports: [AuthService, AuthValidationService, AuthDataService],
})
@Global()
export class AuthModule {}
