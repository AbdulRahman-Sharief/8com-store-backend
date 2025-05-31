import { Expose } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateProductDTO {
  @Expose()
  @IsOptional()
  @IsString()
  name?: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @IsOptional()
  @IsString()
  price?: number;

  @Expose()
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @Expose()
  @IsOptional()
  @IsString()
  category?: string;
}
