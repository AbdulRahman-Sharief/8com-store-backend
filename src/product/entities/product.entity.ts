import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { CategoryEntity } from '../../category/entities/category.entity';
// import { ReviewEntity } from '../review/review.entity';

export type ProductDocument = HydratedDocument<ProductEntity>;
@Schema({ timestamps: true })
export class ProductEntity {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop([
    {
      type: {
        // _id: false,
        public_id: { type: String },
        url: { type: String },
      },
      // required: true,
    },
  ])
  photos: Array<{ public_id: string; url: string }>;

  @Prop([{ type: String, required: true }])
  tags: [string];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  })
  category: CategoryEntity & { _id: mongoose.Schema.Types.ObjectId };
}

export const ProductSchema = SchemaFactory.createForClass(ProductEntity);

// text index for full-text search in mongodb engine
ProductSchema.index({ name: 'text', description: 'text' });
