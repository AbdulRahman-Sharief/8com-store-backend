import { Expose } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateProductDTO {
  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  description: string;

  @Expose()
  // @IsNumber()
  @IsString()
  price: number;

  @Expose()
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @Expose()
  @IsString()
  category: string;
}
