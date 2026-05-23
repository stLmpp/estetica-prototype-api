import {
  IsDate,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { RequestPaginatedModel } from '../../../../shared/model/request.model';
import { TransformDate } from '../../../../shared/decorator/transform-date.decorator';

export class FilterCustomerDto extends RequestPaginatedModel {
  @IsString()
  @IsOptional()
  @Length(1, 1024)
  name?: string;

  @IsOptional()
  @TransformDate()
  @IsDate()
  birthDate?: Date;

  @IsEmail()
  @IsOptional()
  @Length(1, 1024)
  email?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{10,11}$/)
  phone?: string;
}
