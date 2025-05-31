import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

// import { ReviewEntity } from '../review/review.entity';

export type CategoryDocument = HydratedDocument<CategoryEntity>;
@Schema({ timestamps: true })
export class CategoryEntity {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  description: string;
}

export const CategorySchema = SchemaFactory.createForClass(CategoryEntity);
