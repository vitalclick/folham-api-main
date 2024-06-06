import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { LayoutType, Status } from '../types/ad-screen.types';
import FlexLayout, { FlexLayoutSchema } from './flex-layout.schema';

export type AdScreenDocument = AdScreen & Document;

@Schema({ timestamps: true })
export class AdScreen {
  @Prop()
  screenId: string;

  @Prop({ index: true, unique: true })
  name: string;

  @Prop({
    type: MongooseSchema.Types.String,
    enum: Status,
    default: Status.offline,
  })
  status: Status;

  @Prop({
    type: MongooseSchema.Types.String,
    enum: LayoutType,
    default: LayoutType.landscape_full,
  })
  layout: string;

  @Prop({
    type: MongooseSchema.Types.Number,
    min: 1,
  })
  height: number;

  @Prop({
    type: MongooseSchema.Types.Number,
    min: 1,
  })
  width: number;

  @Prop({ type: MongooseSchema.Types.String })
  city: string;

  @Prop({ index: true })
  deviceId: string;

  @Prop({ type: [FlexLayoutSchema] })
  flexLayout: FlexLayout[];

  @Prop({ type: MongooseSchema.Types.Boolean, default: true })
  sendEmailNotification: boolean;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Organization',
  })
  organizationId?: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.Boolean,
    default: false,
  })
  scrollingAds?: boolean;
}
export const AdScreenSchema = SchemaFactory.createForClass(AdScreen);
