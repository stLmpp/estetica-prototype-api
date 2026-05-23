import {
  IsArray,
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';
import { PhoneType } from '../../../../shared/domain/phone-type.enum';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MaritalStatus } from '../../../../shared/domain/marital-status.enum';
import { ResponseModel } from '../../../../shared/model/response.model';
import { TransformDate } from '../../../../shared/decorator/transform-date.decorator';

export class CustomerPhoneResDto {
  @IsNumber()
  @IsInt()
  id!: number;

  @IsEnum(PhoneType)
  type!: PhoneType;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10,11}$/)
  number!: string;
}

export class CreateCustomerResDto {
  @IsNumber()
  @IsInt()
  id!: number;

  @IsString()
  @IsNotEmpty()
  @Length(1, 1024)
  name!: string;

  @IsDate()
  @TransformDate()
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
  @Type(() => CustomerPhoneResDto)
  phones?: CustomerPhoneResDto[];
}

export class CreateCustomerResponseDto {
  @ValidateNested()
  @Type(() => CreateCustomerResDto)
  readonly customer!: CreateCustomerResDto;
}

export class CreateCustomerResponseModel extends ResponseModel(
  CreateCustomerResponseDto,
) {}
