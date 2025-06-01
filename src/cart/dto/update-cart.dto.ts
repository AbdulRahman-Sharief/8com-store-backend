// update-cart.dto.ts
import {
  IsArray,
  IsDate,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { CARTS_ACTIONS } from 'config/constants/constants';
const CARTS_ACTIONS_VALUES = Object.values(CARTS_ACTIONS);
class UpdateCartItemDto {
  @Expose()
  @IsMongoId()
  @IsOptional()
  product?: string;

  @Expose()
  @IsNumber()
  @IsOptional()
  quantity?: number;

  @Expose()
  @IsNumber()
  @IsOptional()
  priceAtAdd?: number;

  @Expose()
  @IsDate()
  @IsOptional()
  addedAt?: Date;

  @Expose()
  @IsNotEmpty()
  @IsIn(CARTS_ACTIONS_VALUES) // Validate against **values** like 'add', 'remove', 'update'
  action: (typeof CARTS_ACTIONS)[keyof typeof CARTS_ACTIONS]; // Dynamic field based on CART_ACTIONS
}

export class UpdateCartDto {
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCartItemDto)
  @IsOptional()
  items?: UpdateCartItemDto[];
}
