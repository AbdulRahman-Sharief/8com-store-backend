import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CategoryDocument, CategoryEntity } from './entities/category.entity';
import { Model } from 'mongoose';
import { CreateCategoryDTO } from './dto/create-category.dto';

import { UpdateCategoryDTO } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel('Category') private categoryModel: Model<CategoryEntity>,
  ) {}

  async createCategory({
    title,
    description,
  }: CreateCategoryDTO): Promise<CategoryEntity> {
    const newCategory = new this.categoryModel({
      title,
      description,
    });

    return await newCategory.save();
  }

  async getOneCategoryByTitle(title: string): Promise<CategoryEntity> {
    return await this.categoryModel.findOne({ title });
  }

  async getOneCategoryById(categoryId: string): Promise<CategoryEntity> {
    return await this.categoryModel.findOne({
      _id: categoryId,
    });
  }

  async getAllCategories(): Promise<CategoryEntity[]> {
    //populate the recursive categories
    return await this.categoryModel.find();
  }
  async updateCategory(
    categoryId: string,
    { ...sanitizedBody }: UpdateCategoryDTO,
  ): Promise<CategoryEntity> {
    const filesToUpdate = {} as any;

    const updatedCategory = await this.categoryModel.findByIdAndUpdate(
      categoryId,
      {
        $set: {
          ...sanitizedBody,
          ...filesToUpdate,
        },
      },
      { new: true, runValidators: true },
    );
    return updatedCategory;
  }

  async deleteCategory(categoryId: string): Promise<CategoryEntity> {
    return await this.categoryModel.findByIdAndDelete(categoryId);
  }
}
