import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class CreateCategoryDTO {
  @Expose()
  @IsString()
  title: string;
  @Expose()
  @IsString()
  description: string;
}
