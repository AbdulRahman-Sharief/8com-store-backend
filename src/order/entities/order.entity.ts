import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ProductEntity } from 'src/product/entities/product.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { ORDER_STATUS } from 'config/constants/constants';

export type OrderDocument = OrderEntity & Document;

@Schema({ timestamps: true })
export class OrderEntity {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  customer: UserEntity & { _id: mongoose.Schema.Types.ObjectId };

  @Prop({
    type: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, required: true },
        priceAtCheckout: { type: Number },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    immutable: true,
  })
  items: {
    product: ProductEntity & { _id: mongoose.Schema.Types.ObjectId };
    quantity: number;
    priceAtCheckout?: number;
    addedAt?: Date;
  }[];

  @Prop({ required: true })
  total: number;

  @Prop({
    default: ORDER_STATUS.PLACED,
    enum: Object.values(ORDER_STATUS),
  })
  status: string;
}

export const OrderSchema = SchemaFactory.createForClass(OrderEntity);
