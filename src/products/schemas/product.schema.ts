import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Category } from '../../categories/schemas/category.schema';

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  description: string;

  @Prop()
  imageUrl: string;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  category: Types.ObjectId | Category;

  @Prop({ required: true, default: 0 })
  stock: number;

  @Prop({ unique: true })
  sku: string;

  @Prop({ default: true })
  isActive: boolean;
}

export type ProductDocument = HydratedDocument<Product>;
export const ProductSchema = SchemaFactory.createForClass(Product);