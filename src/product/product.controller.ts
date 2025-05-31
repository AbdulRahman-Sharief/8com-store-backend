import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  FileTypeValidator,
  Res,
  HttpStatus,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDTO } from './dto/create-product.dto';
import { UpdateProductDTO } from './dto/update-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { CategoryService } from 'src/category/category.service';
import { Request, Response } from 'express';
import { UploadService } from 'src/upload/upload.service';
import { join } from 'path';
import { Types } from 'mongoose';
import { sanitizeBody } from 'src/utils/sanitizeBody';
import { RolesGuard } from 'src/auth/guards/role-auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { USERS_ROLES } from 'config/constants/constants';
import { Public } from 'src/decorators/Public.decorator';
@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles([USERS_ROLES.ADMIN])
  @UseInterceptors(
    FilesInterceptor(
      'photos',
      10,
      //   {
      //   storage: diskStorage({
      //     destination: './uploads/products',
      //     filename: (req, file, cb) => {
      //       const randomName = Array(32)
      //         .fill(null)
      //         .map(() => Math.round(Math.random() * 16).toString(16))
      //         .join('');
      //       cb(null, `${randomName}${extname(file.originalname)}`);
      //     },
      //   }),
      // }
    ),
  )
  @Serialize(CreateProductDTO) // Apply the serialization interceptor
  async createProduct(
    @Body() body: CreateProductDTO,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: /.(jpg|jpeg|png|gif|bmp|tiff|webp)$/i,
          }),
        ],
        fileIsRequired: false,
      }),
    )
    photos: Express.Multer.File[],
    @Res() res: Response,
  ) {
    const { name, description, price, tags, category } = body;

    //check if the store exist.
    const categoryDB = await this.categoryService.getOneCategoryById(category);
    if (!categoryDB)
      return res.status(HttpStatus.NOT_FOUND).json({
        status: 'failed',
        message: 'No Category with such ID.',
      });

    const photoEntries = await this.uploadService.uploadMultiplePhotos(
      photos,
      join(__dirname, '../../../public/ecommerce/products'),
    );
    console.log(photoEntries);
    const newProduct = await this.productService.createProduct({
      name,
      description,
      price,
      tags,
      photos: photoEntries || [],
      category,
    });
    console.log(newProduct);
    if (newProduct.photos.length >= 0) {
      newProduct.photos.map((photo) => {
        photo.url = `${process.env.BACKEND_ORIGIN}/api/products/${photo.url.split('/')[photo.url.split('/').length - 1]}`;
        return photo;
      });
    }

    return res.status(HttpStatus.CREATED).json({
      status: 'success',
      message: 'successfully created the product.',
      data: newProduct,
    });
  }

  @Patch(':productId')
  @UseGuards(RolesGuard)
  @Roles([USERS_ROLES.ADMIN])
  @UseInterceptors(
    FilesInterceptor(
      'photos',
      10,
      // {
      // storage: diskStorage({
      //   destination: './uploads',
      //   filename: (req, file, cb) => {
      //     const randomName = Array(32)
      //       .fill(null)
      //       .map(() => Math.round(Math.random() * 16).toString(16))
      //       .join('');
      //     cb(null, `${randomName}${extname(file.originalname)}`);
      //   },
      // }),
      // }
    ),
  )
  @Serialize(UpdateProductDTO) // Apply the serialization interceptor
  async updateProduct(
    @Param('productId') productId: string,
    @Body() body: UpdateProductDTO,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: /.(jpg|jpeg|png|gif|bmp|tiff|webp|svg)$/i,
          }),
        ],
        fileIsRequired: false,
      }),
    )
    photos: Express.Multer.File[],
    @Req() req: Request,
    @Res() res: Response,
  ) {
    //productId validation
    if (
      !(
        Types.ObjectId.isValid(productId) &&
        new Types.ObjectId(productId).toString() === productId
      )
    )
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: 'failed',
        message: 'not valid product ID.',
      });

    //check if the product exist.
    const product = await this.productService.getOneProduct(productId);
    if (!product)
      return res.status(HttpStatus.NOT_FOUND).json({
        status: 'failed',
        message: 'No Product with such ID.',
      });

    const sanitizedBody = sanitizeBody(body);
    console.log(sanitizedBody);

    if (
      Object.keys(sanitizedBody).length === 0 &&
      !photos &&
      photos.length <= 0
    )
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: 'failed',
        message: 'body is empty!',
      });

    const { category } = body;

    if (category) {
      //check if the category exist.
      const categoryDB =
        await this.categoryService.getOneCategoryById(category);
      if (!categoryDB)
        return res.status(HttpStatus.NOT_FOUND).json({
          status: 'failed',
          message: 'No Category with such ID.',
        });
    }

    try {
      const photoEntries = await this.uploadService.uploadMultiplePhotos(
        photos,
        join(__dirname, '../../../public/ecommerce/products'),
      );
      const updatedProduct = await this.productService.updateProduct(
        productId,
        {
          photos: photoEntries || [],
          ...sanitizedBody,
        },
      );

      if (updatedProduct) {
        if (updatedProduct.photos.length >= 0) {
          await this.uploadService.deleteMultiplePhotos(
            product.photos
              .map((photo) => photo.url)
              .filter(
                (url) =>
                  !updatedProduct.photos
                    .map((photo) => photo.url)
                    .includes(url),
              ),
          );
          updatedProduct.photos.map((photo) => {
            photo.url = `${process.env.BACKEND_ORIGIN}/api/products/${photo.url.split('/')[photo.url.split('/').length - 1]}`;
            return photo;
          });
        }
        return res.status(HttpStatus.OK).json({
          status: 'success',
          message: 'successfully updated the product.',
          data: updatedProduct,
        });
      }
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: 'failed',
        message: error.message,
      });
    }
  }

  @Delete(':productId')
  @UseGuards(RolesGuard)
  @Roles([USERS_ROLES.ADMIN])
  async deleteProduct(
    @Param('productId') productId: string,
    @Res() res: Response,
  ) {
    if (
      !(
        Types.ObjectId.isValid(productId) &&
        new Types.ObjectId(productId).toString() === productId
      )
    )
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: 'failed',
        message: 'not valid product ID.',
      });

    try {
      //check if the product exist.
      const productDB = await this.productService.getOneProduct(productId);
      if (!productDB)
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'failed',
          message: 'no product with such Id.',
        });

      const deletedProduct = await this.productService.deleteProduct(productId);

      await this.uploadService.deleteMultiplePhotos(
        deletedProduct.photos.map((photo) => photo.url),
      );

      if (deletedProduct.photos.length >= 0) {
        deletedProduct.photos.map((photo) => {
          photo.url = `${process.env.BACKEND_ORIGIN}/api/products/${photo.url.split('/')[photo.url.split('/').length - 1]}`;
          return photo;
        });
      }
      return res.status(HttpStatus.NO_CONTENT).json({
        status: 'success',
        message: `successfully delete product with ${productId}`,
        data: deletedProduct,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: 'failed',
        message: error.message,
      });
    }
  }

  @Public()
  @Get()
  async getAllProductsOfStore(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Res() res: Response,
  ) {
    const productsResult = await this.productService.getAllProductsOfStore({
      page: Number(page),
      limit: Number(limit),
    });

    if (!productsResult.products || productsResult.products.length <= 0)
      return res.status(HttpStatus.NOT_FOUND).json({
        status: 'failed',
        message: `no products found`,
      });

    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: `Successfully retrieved all products`,
      data: {
        products: productsResult.products.map((product) => {
          if (product.photos.length >= 0) {
            product.photos = product.photos.map((photo) => {
              photo.url = `${process.env.BACKEND_ORIGIN}/api/products/${photo.url.split('/')[photo.url.split('/').length - 1]}`;
              return photo;
            });
          }
          return product;
        }),

        ...productsResult,
      },
    });
  }

  @Public()
  @Get(':productId')
  async getOneProduct(
    @Param('productId') productId: string,
    @Res() res: Response,
  ) {
    if (
      !(
        Types.ObjectId.isValid(productId) &&
        new Types.ObjectId(productId).toString() === productId
      )
    )
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: 'failed',
        message: 'not valid product ID.',
      });

    const product = await this.productService.getOneProduct(productId);

    if (!product)
      return res.status(HttpStatus.NOT_FOUND).json({
        status: 'failed',
        message: `no products with such Id.`,
      });
    if (product.photos && product.photos.length >= 0) {
      product.photos.map((photo) => {
        photo.url = `${process.env.BACKEND_ORIGIN}/api/products/${photo.url.split('/')[photo.url.split('/').length - 1]}`;
        return photo;
      });
    }

    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: `Successfully retrieved product with id : ${productId}`,
      data: product,
    });
  }

  @Public()
  //get ll products of specific category
  @Get('/category/:categoryId')
  async getAllProductsOfCategory(
    @Param('categoryId') categoryId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Res() res: Response,
  ) {
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

    const categoryDB =
      await this.categoryService.getOneCategoryById(categoryId);

    if (!categoryDB)
      return res.status(HttpStatus.OK).json({
        status: 'failed',
        message: 'no Category with such ID.',
      });

    const productsResult = await this.productService.getAllProductsOfCategory(
      { page: Number(page), limit: Number(limit) },
      categoryId,
    );

    if (!productsResult.products || productsResult.products.length <= 0)
      return res.status(HttpStatus.NOT_FOUND).json({
        status: 'failed',
        message: `no products in store: ${categoryDB.title}`,
      });

    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: `Successfully retrieved all products of store: ${categoryDB.title}`,
      data: {
        products: productsResult.products.map((product) => {
          if (product.photos.length >= 0) {
            product.photos = product.photos.map((photo) => {
              photo.url = `${process.env.BACKEND_ORIGIN}/api/products/${photo.url.split('/')[photo.url.split('/').length - 1]}`;
              return photo;
            });
          }
          return product;
        }),
        ...productsResult,
      },
    });
  }

  @Public()
  @Get('search/all')
  async search(
    @Res() res: Response,
    @Query('searchTerm') searchTerm?: string,
    @Query('tags') tags?: string[],
    @Query('parentCategoryId') parentCategoryId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    if (!parentCategoryId && !searchTerm && !tags && !minPrice && !maxPrice) {
      return res.status(HttpStatus.OK).json({
        status: 'failed',
        message: "You didn't send any search parameter!",
        data: [],
      });
    }

    const categoryIds = [];
    if (parentCategoryId) {
      if (
        !(
          Types.ObjectId.isValid(parentCategoryId) &&
          new Types.ObjectId(parentCategoryId).toString() === parentCategoryId
        )
      )
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'failed',
          message: 'not valid category ID.',
        });

      const categoryDB =
        await this.categoryService.getOneCategoryById(parentCategoryId);

      if (!categoryDB)
        return res.status(HttpStatus.OK).json({
          status: 'failed',
          message: 'no Category with such ID.',
        });
      categoryIds.push(parentCategoryId);
    }
    console.log(tags);
    console.log(categoryIds);
    console.log(Number(minPrice), Number(maxPrice));
    const productsResults = await this.productService.searchProducts(
      { page: Number(page), limit: Number(limit) },
      searchTerm,
      tags,
      categoryIds,
      minPrice,
      maxPrice,
    );

    if (!productsResults.products || productsResults.products.length <= 0)
      return res.status(HttpStatus.OK).json({
        status: 'failed',
        message: 'There is no products matches this search.',
        data: [],
      });

    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: 'Successfully retrieved the products.',
      data: {
        products: productsResults.products.map((product) => {
          if (product.photos && product.photos.length >= 0) {
            product.photos = product.photos.map((photo) => {
              photo.url = `${process.env.BACKEND_ORIGIN}/api/products/${photo.url.split('/')[photo.url.split('/').length - 1]}`;
              return photo;
            });
          }
          return product;
        }),
        ...productsResults,
      },
    });
  }
}
