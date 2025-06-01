import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { ProductEntity } from 'src/product/entities/product.entity';
import { UserEntity } from 'src/user/entities/user.entity';

export type CartDocument = CartEntity & Document;

@Schema({ timestamps: true }) // Adds createdAt and updatedAt
export class CartEntity {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  })
  customer: UserEntity & { _id: mongoose.Schema.Types.ObjectId };

  @Prop([
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: { type: Number, required: true },
      priceAtAdd: { type: Number },
      addedAt: { type: Date, default: Date.now },
    },
  ])
  items: {
    product: ProductEntity & { _id: mongoose.Schema.Types.ObjectId };
    quantity: number;
    priceAtAdd?: number;
    addedAt?: Date;
  }[];
}

export const CartSchema = SchemaFactory.createForClass(CartEntity);
