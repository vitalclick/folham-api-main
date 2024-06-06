import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';
import AdFile from './adfile.schema';

export type AdsDocument = Ads & Document;

@Schema({ timestamps: true, strict: false })
export class Ads {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'AdAccount',
    index: true,
  })
  adAccount: Types.ObjectId;

  @Prop({ type: [MongooseSchema.Types.Mixed] })
  adFile?: AdFile[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Organization',
  })
  organizationId?: Types.ObjectId;
}
export const AdsSchema = SchemaFactory.createForClass(Ads);
