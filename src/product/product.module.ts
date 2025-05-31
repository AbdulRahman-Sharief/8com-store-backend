import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { CategoryService } from 'src/category/category.service';
import { UploadService } from 'src/upload/upload.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService, CategoryService, UploadService],
})
export class ProductModule {}
