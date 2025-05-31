import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDTO } from './dto/create-category.dto';
import { UpdateCategoryDTO } from './dto/update-category.dto';
import { Response } from 'express';
import { Types } from 'mongoose';
import { sanitizeBody } from 'src/utils/sanitizeBody';
import { ProductService } from 'src/product/product.service';
import { RolesGuard } from 'src/auth/guards/role-auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { USERS_ROLES } from 'config/constants/constants';
@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly productService: ProductService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles([USERS_ROLES.ADMIN])
  async create(@Res() res: Response, @Body() body: CreateCategoryDTO) {
    try {
      const { title, description } = body;
      //check if the category exist.
      const category = await this.categoryService.getOneCategoryByTitle(title);
      if (category)
        return res.status(HttpStatus.CONFLICT).json({
          status: 'failed',
          messageEn: 'You created a category with this title before.',
          messageAr: 'أنت أنشأت تصنيف بهذا العنوان من قبل.',
        });

      const newCategory = await this.categoryService.createCategory({
        title,
        description,
      });

      if (!newCategory)
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'failed',
          message:
            'Failed to create the category due to unexpected server error.',
        });

      return res.status(HttpStatus.CREATED).json({
        status: 'success',
        message: 'Successfully created the category.',
        data: newCategory,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: 'failed',
        message: error.message,
      });
    }
  }

  @Patch(':categoryId')
  @UseGuards(RolesGuard)
  @Roles([USERS_ROLES.ADMIN])
  async updateCategory(
    @Res() res: Response,
    @Param('categoryId') categoryId: string,
    @Body() body: UpdateCategoryDTO,
  ) {
    try {
      //check if the id is valid objectId
      if (
        !(
          Types.ObjectId.isValid(categoryId) &&
          new Types.ObjectId(categoryId).toString() === categoryId
        )
      )
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'failed',
          messageEn: 'not valid category ID.',
          messageAr: 'معرف تصنيف غير صالح.',
        });

      //check if the category exist.
      const category =
        await this.categoryService.getOneCategoryById(categoryId);
      if (!category)
        return res.status(HttpStatus.CONFLICT).json({
          status: 'failed',
          message: 'No Category with such ID.',
        });

      const { title, description } = body;
      console.log(body);

      //sanitize the request body.
      const sanitizedBody = sanitizeBody(body);
      console.log(sanitizedBody);
      if (Object.keys(sanitizedBody).length === 0)
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'failed',
          message: 'body is empty!',
        });

      try {
        const updatedCategory = await this.categoryService.updateCategory(
          categoryId,
          {
            ...sanitizedBody,
          },
        );

        if (updatedCategory) {
          return res.status(HttpStatus.OK).json({
            status: 'success',
            message: 'successfully updated the catgory.',

            data: updatedCategory,
          });
        }
      } catch (error) {
        console.log(error);
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'failed',
          message: error.message,
        });
      }
    } catch (error) {
      return error;
    }
  }

  @Delete('/:categoryId')
  @UseGuards(RolesGuard)
  @Roles([USERS_ROLES.ADMIN])
  async deleteCategory(
    @Param('categoryId') categoryId: string,
    @Res() res: Response,
  ) {
    //check if the id is valid objectId
    if (
      !(
        Types.ObjectId.isValid(categoryId) &&
        new Types.ObjectId(categoryId).toString() === categoryId
      )
    )
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: 'failed',
        message: 'not valid category ID.',
      });
    try {
      //delete

      const deletedCategory =
        await this.categoryService.deleteCategory(categoryId);

      return res.status(HttpStatus.NO_CONTENT).json({
        status: 'success',
        message: `successfully deleted category with ${categoryId}`,
        data: deletedCategory,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: 'failed',
        message: error.message,
      });
    }
  }
  @Get()
  @UseGuards(RolesGuard)
  @Roles([USERS_ROLES.ADMIN])
  async findAll(@Res() res: Response) {
    try {
      //check if the category exist.
      const AllCategories = await this.categoryService.getAllCategories();
      if (!AllCategories || AllCategories.length === 0)
        return res.status(HttpStatus.CONFLICT).json({
          status: 'failed',
          message: 'No Categories found.',
        });

      return res.status(HttpStatus.OK).json({
        status: 'success',
        message: 'successfully retrieved all categories.',
        data: AllCategories,
      });
    } catch (error) {
      console.log(error);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: 'failed',
        message: error.message,
      });
    }
  }

  @Get(':categoryId')
  @UseGuards(RolesGuard)
  @Roles([USERS_ROLES.ADMIN])
  async findOneById(
    @Param('categoryId') categoryId: string,
    @Res() res: Response,
  ) {
    try {
      //check if the category exist.

      const category =
        await this.categoryService.getOneCategoryById(categoryId);
      if (!category)
        return res.status(HttpStatus.CONFLICT).json({
          status: 'failed',
          message: 'No Category with such ID.',
        });

      return res.status(HttpStatus.OK).json({
        status: 'success',
        message: 'successfully retrieved the category.',
        data: category,
      });
    } catch (error) {
      console.log(error);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: 'failed',
        message: error.message,
      });
    }
  }
}
