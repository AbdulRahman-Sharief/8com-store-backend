import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CartSchema } from 'src/cart/entities/cart.entity';
import { CategorySchema } from 'src/category/entities/category.entity';
import { ProductSchema } from 'src/product/entities/product.entity';
import { UserSchema } from 'src/user/entities/user.entity';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME,
      // autoCreate: true,
      // autoIndex: true,
    }),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'Category', schema: CategorySchema }]),
    MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
    MongooseModule.forFeature([{ name: 'Cart', schema: CartSchema }]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
