import { IsInt, IsNumber, IsString, Length } from 'class-validator';
import { ResponsePaginatedModel } from '../../../../shared/model/response.model';

export class CustomerDto {
  @IsNumber()
  @IsInt()
  id!: number;

  @IsString()
  @Length(1, 1024)
  name!: string;
}

export class ListCustomerResponseModel extends ResponsePaginatedModel(
  CustomerDto,
) {}
