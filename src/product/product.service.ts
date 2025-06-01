import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder, Types } from 'mongoose';
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
    stock = 1, // default stock value
    owner,
  }: CreateProductDTO & {
    photos?: object[];
    owner: string;
  }): Promise<ProductEntity> {
    const newProduct = new this.ProductModel({
      name,
      description,
      price,
      tags,
      photos,
      category,
      stock,
      owner,
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
    limit?: number;
    cursor?: string; // The last _id from previous query
    [key: string]: any;
  }) {
    const { limit = 10, cursor, ...filters } = queryOptions;
    console.log('queryOptions', filters);

    // Build the query filter
    const query: any = { ...filters };

    if (cursor) {
      query._id = { $lt: new Types.ObjectId(cursor) };
    }

    // Query products sorted by _id descending (newest first)
    const products = await this.ProductModel.find(query)
      .sort({ _id: -1 })
      .limit(limit + 1) // fetch one extra to check if there's a next page
      .populate('category');
    console.log('products', products);
    let nextCursor: string | null = null;

    if (products.length > limit) {
      // We have extra product, so pagination continues
      const extraProduct = products.pop(); // remove extra product
      // nextCursor is the _id of the last product currently returned (not the popped one)
      nextCursor = products[products.length - 1]._id.toString();
    } else if (products.length > 0) {
      // no extra product, so last product's _id is the nextCursor null (end of pages)
      nextCursor = null;
    }

    const totalProductsCount = await this.ProductModel.countDocuments(filters);

    return {
      products: products,
      totalProductsCount,
      nextCursor,
    };
  }
  async getAllProductsOfSeller(
    queryOptions: {
      cursor?: string;
      limit?: number;
      [key: string]: any;
    },
    sellerId: string,
  ) {
    const { cursor, limit = 10, ...filters } = queryOptions;

    if (sellerId) {
      filters['owner'] = sellerId;
    }
    const totalProductsCount = await this.ProductModel.countDocuments(filters);

    // If a cursor is provided, only get products with _id < cursor (for descending order)
    if (cursor) {
      filters['_id'] = { $lt: new Types.ObjectId(cursor) };
    }

    console.log('queryOptions', filters);

    // Fetch limit + 1 products to detect if there’s a next page
    const products = await this.ProductModel.find(filters)
      .sort({ _id: -1 }) // descending
      .limit(limit + 1)
      .populate('category owner');

    let nextCursor: string | null = null;

    // If we got more than limit, we have a next page
    if (products.length > limit) {
      // Remove extra product for this page
      const extraProduct = products.pop();

      // nextCursor will be the _id of the last product in the returned page
      nextCursor = products[products.length - 1]._id.toString();
    }

    return {
      products,
      totalProductsCount,
      nextCursor,
    };
  }
  async getAllProductsOfCategory(
    queryOptions: {
      cursor?: string;
      limit?: number;
      [key: string]: any;
    },
    categoryId: string,
  ) {
    const { cursor, limit = 10, ...filters } = queryOptions;

    if (categoryId) {
      filters['category'] = categoryId;
    }
    const totalProductsCount = await this.ProductModel.countDocuments(filters);

    // If a cursor is provided, only get products with _id < cursor (for descending order)
    if (cursor) {
      filters['_id'] = { $lt: new Types.ObjectId(cursor) };
    }

    console.log('queryOptions', filters);

    // Fetch limit + 1 products to detect if there’s a next page
    const products = await this.ProductModel.find(filters)
      .sort({ _id: -1 }) // descending
      .limit(limit + 1)
      .populate('category');

    let nextCursor: string | null = null;

    // If we got more than limit, we have a next page
    if (products.length > limit) {
      // Remove extra product for this page
      const extraProduct = products.pop();

      // nextCursor will be the _id of the last product in the returned page
      nextCursor = products[products.length - 1]._id.toString();
    }

    return {
      products,
      totalProductsCount,
      nextCursor,
    };
  }

  async getOneProduct(productId: string): Promise<ProductEntity> {
    return await this.ProductModel.findById(productId).populate(
      'category owner',
    );
  }

  // async getAllProductsWithIds(productIds: string[]): Promise<ProductEntity[]> {
  //   return await this.ProductModel.find({ _id: { $in: productIds } }).populate(
  //     'category',
  //   );
  // }

  async searchProducts(
    queryOptions: {
      cursor?: string;
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

    const { cursor, limit = 10, ...filters } = queryOptions;

    // 1️⃣ Calculate totalProductsResults **before** adding cursor condition
    const totalProductsResults = await this.ProductModel.countDocuments(query);

    // 2️⃣ Now add the cursor to the query for pagination
    if (cursor) {
      query['_id'] = { $lt: new Types.ObjectId(cursor) };
    }

    // 3️⃣ Determine sorting and projection
    const sortBy: { [key: string]: SortOrder | { $meta: 'textScore' } } =
      searchTerm ? { score: { $meta: 'textScore' }, _id: -1 } : { _id: -1 };

    const projection = searchTerm ? { score: { $meta: 'textScore' } } : {};

    // 4️⃣ Fetch limit + 1 to determine if next page exists
    const products = await this.ProductModel.find(query, projection)
      .sort(sortBy)
      .limit(limit + 1)
      .populate('category');

    let nextCursor: string | null = null;

    if (products.length > limit) {
      products.pop();
      nextCursor = products[products.length - 1]._id.toString();
    }

    return {
      products,
      totalProductsResults,
      nextCursor,
    };
  }

  async getNumberOfProductsInCategory(categoryId: string): Promise<number> {
    const numberOfProducts = await this.ProductModel.countDocuments({
      category: categoryId,
    });
    return numberOfProducts;
  }
}
