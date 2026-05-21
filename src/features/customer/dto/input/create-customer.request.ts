import {
  IsArray,
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
import { PhoneType } from '../../../../shared/domain/phone-type.enum';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MaritalStatus } from '../../../../shared/domain/marital-status.enum';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 1024)
  name!: string;

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCustomerPhoneDto)
  phones?: CreateCustomerPhoneDto[];
}

export class CreateCustomerPhoneDto {
  @IsEnum(PhoneType)
  type!: PhoneType;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10,11}$/)
  number!: string;
}

export class CustomerCreateRequest {
  @Type(() => CreateCustomerDto)
  @ValidateNested()
  readonly customer!: CreateCustomerDto;
}
