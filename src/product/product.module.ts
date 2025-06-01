import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { CategoryService } from 'src/category/category.service';
import { UploadService } from 'src/upload/upload.service';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService, CategoryService, UploadService, UserService],
})
export class ProductModule {}
