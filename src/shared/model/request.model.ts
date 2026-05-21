import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNumber } from 'class-validator';
import { TransformNumber } from '../transform-number';

export class RequestPaginatedModel {
  @TransformNumber()
  @IsNumber()
  @IsInt()
  @ApiProperty({ default: 1, type: 'number' })
  page = 1;

  @TransformNumber()
  @IsNumber()
  @IsInt()
  @IsIn([10, 25, 50, 100])
  @ApiProperty({ default: 10, type: 'number' })
  limit = 10;
}
