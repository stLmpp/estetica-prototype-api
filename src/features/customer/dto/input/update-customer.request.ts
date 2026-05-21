import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { MaritalStatus } from '../../../../shared/domain/marital-status.enum';
import { ApiProperty } from '@nestjs/swagger';
import { CreateCustomerDto } from './create-customer.request';

export class UpdateCustomerDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 1024)
  @IsOptional()
  name?: string;

  @IsDateString()
  @Transform(({ value }) => new Date(String(value)))
  @IsOptional()
  @ApiProperty({
    format: 'date',
  })
  birthDate?: Date;

  @IsString()
  @IsNotEmpty()
  @Length(1, 1024)
  @IsOptional()
  address?: string;

  @IsString()
  @Matches(/^\d{8}$/)
  @IsOptional()
  zipCode?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 256)
  @IsOptional()
  neighborhood?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 256)
  @IsOptional()
  city?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 256)
  @IsOptional()
  state?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 256)
  @IsOptional()
  jobName?: string;

  @IsEnum(MaritalStatus)
  @IsOptional()
  maritalStatus?: MaritalStatus;

  @IsEmail()
  @IsOptional()
  email?: string;
}

export class UpdateCustomerRequest {
  @Type(() => CreateCustomerDto)
  @ValidateNested()
  readonly customer!: UpdateCustomerDto;
}
