// create-cart.dto.ts
import {
  IsArray,
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';

class CartItemDto {
  @Expose()
  @IsMongoId()
  @IsNotEmpty()
  product: string;

  @Expose()
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @Expose()
  @IsNumber()
  @IsOptional()
  priceAtAdd?: number;
}

export class CreateCartDto {
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];
}
