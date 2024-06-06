import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';

export type ScrollingAdsDocument = ScrollingAds & Document;
export enum adType {
  info = 'info',
  news = 'news',
  event = 'event',
  betnaija = 'betnaija',
}

@Schema({ timestamps: true, strict: false })
export class ScrollingAds {
  @Prop({
    type: MongooseSchema.Types.String,
    index: true,
  })
  name: string;

  @Prop({
    type: MongooseSchema.Types.String,
    enum: Object.values(adType),
    index: true,
  })
  type: adType;

  @Prop({
    type: MongooseSchema.Types.Boolean,
    default: true,
  })
  isActive = true;

  @Prop({
    type: MongooseSchema.Types.Date,
    default: new Date(),
  })
  startTime = new Date();

  @Prop({
    type: MongooseSchema.Types.Date,
    default: new Date(),
  })
  endTime = new Date();

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'AdScreens',
  })
  screenIds: Types.ObjectId[];
}
export const ScrollingAdsSchema = SchemaFactory.createForClass(ScrollingAds);
