import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';

export type ContentDetailsDocument = ContentDetails & Document;

@Schema({ timestamps: true, strict: false })
export class ContentDetails {
  @Prop({
    type: MongooseSchema.Types.String,
    index: true,
  })
  message: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'ScrollingAds',
  })
  scrollingAdId: Types.ObjectId;
}
export const ContentDetailsSchema =
  SchemaFactory.createForClass(ContentDetails);
