import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { ProductEntity } from './entities/product.entity';
import { UserEntity } from '../user/entities/user.entity';
import { CreateProductDTO } from './dto/create-product.dto';
// import { v4 as uuidv4 } from 'uuid';
// import { extname } from 'path';
// import { promises as fs } from 'fs';
import { UpdateProductDTO } from './dto/update-product.dto';
import { CategoryService } from 'src/category/category.service';
// import { Types } from 'mongoose';
// import { filter } from 'rxjs';
@Injectable()
export class ProductService {
  constructor(
    @InjectModel('User') private UserModel: Model<UserEntity>,
    @InjectModel('Product') private ProductModel: Model<ProductEntity>,
    private categoryService: CategoryService,
  ) {}

  async createProduct({
    name,
    description,
    price,
    tags,
    category,
    photos,
  }: CreateProductDTO & {
    photos?: object[];
  }): Promise<ProductEntity> {
    const newProduct = new this.ProductModel({
      name,
      description,
      price,
      tags,
      photos,
      category,
    });

    return await newProduct.save();
  }

  async updateProduct(
    productId: string,
    { photos, ...sanitizedBody }: UpdateProductDTO & { photos?: object[] },
  ): Promise<ProductEntity> {
    try {
      const filesToUpdate = {} as any;
      if (photos.length > 0) filesToUpdate.photos = photos;
      return await this.ProductModel.findByIdAndUpdate(
        productId,
        {
          $set: {
            ...filesToUpdate,
            ...sanitizedBody,
          },
        },
        { new: true, runValidators: true },
      );
    } catch (error) {
      return error;
    }
  }

  async deleteProduct(productId: string) {
    return await this.ProductModel.findByIdAndDelete(productId);
  }

  async getAllProductsOfStore(queryOptions: {
    page?: number;
    limit?: number;
    [key: string]: any;
  }) {
    const { page = 1, limit = 10, ...filters } = queryOptions;
    console.log('queryOptions', filters);

    const allProducts = await this.ProductModel.find(filters)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('category');

    const totalProducts = await this.ProductModel.countDocuments(filters);

    return {
      products: allProducts,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
    };
  }
  async getAllProductsOfCategory(
    queryOptions: {
      page?: number;
      limit?: number;
      [key: string]: any;
    },
    categoryId: string,
  ) {
    const { page = 1, limit = 10, ...filters } = queryOptions;
    if (categoryId) {
      filters['category'] = categoryId;
    }

    console.log('queryOptions', filters);
    const allProducts = await this.ProductModel.find(filters)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('category');
    const totalProducts = await this.ProductModel.countDocuments(filters);
    return {
      products: allProducts,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
    };
  }

  async getOneProduct(productId: string): Promise<ProductEntity> {
    return await this.ProductModel.findById(productId).populate('category');
  }

  // async getAllProductsWithIds(productIds: string[]): Promise<ProductEntity[]> {
  //   return await this.ProductModel.find({ _id: { $in: productIds } }).populate(
  //     'category',
  //   );
  // }

  async searchProducts(
    queryOptions: {
      page?: number;
      limit?: number;
      [key: string]: any;
    },
    searchTerm?: string,
    tags?: string[],
    categoryIds?: string[],
    minPrice?: string,
    maxPrice?: string,
  ) {
    const query: any = {};
    // Full-text search on name + description
    if (searchTerm) {
      query.$text = { $search: searchTerm };
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      query.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };
    } else if (minPrice !== undefined) {
      query.price = { $gte: Number(minPrice) };
    } else if (maxPrice !== undefined) {
      query.price = { $lte: Number(maxPrice) };
    }
    if (categoryIds && categoryIds.length > 0) {
      query['category'] = { $in: categoryIds };
    }
    const { page = 1, limit = 10, ...filters } = queryOptions;

    // Use text score for sorting by relevance if $text search is used
    const sortBy: { [key: string]: SortOrder | { $meta: 'textScore' } } =
      searchTerm
        ? { score: { $meta: 'textScore' }, createdAt: -1 }
        : { createdAt: -1 };

    // Build the query with projection for score if using text search
    const productsResults = await this.ProductModel.find(
      query,
      searchTerm ? { score: { $meta: 'textScore' } } : {},
    )
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('category');

    const totalProductsResults = await this.ProductModel.countDocuments(query);

    return {
      products: productsResults,
      totalProductsResults,
      totalPages: Math.ceil(totalProductsResults / limit),
      currentPage: page,
    };
  }

  async getNumberOfProductsInCategory(categoryId: string): Promise<number> {
    const numberOfProducts = await this.ProductModel.countDocuments({
      category: categoryId,
    });
    return numberOfProducts;
  }
}
