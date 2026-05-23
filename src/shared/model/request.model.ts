import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNumber } from 'class-validator';
import { TransformNumberDecorator } from '../decorator/transform-number.decorator';

export class RequestPaginatedModel {
  @TransformNumberDecorator()
  @IsNumber()
  @IsInt()
  @ApiProperty({ default: 1, type: 'number' })
  page = 1;

  @TransformNumberDecorator()
  @IsNumber()
  @IsInt()
  @IsIn([10, 25, 50, 100])
  @ApiProperty({ default: 10, type: 'number' })
  limit = 10;
}
