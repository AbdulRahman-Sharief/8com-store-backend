import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { ProductService } from 'src/product/product.service';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, ProductService],
})
export class CategoryModule {}
