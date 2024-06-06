import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

export type AdAccountDocument = AdAccount & Document;

@Schema({ timestamps: true })
export class AdAccount {
  @Prop({ index: true, unique: true })
  name: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'AdCompany', index: true })
  adCompany: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'AdScreen', index: true })
  adScreen: Types.ObjectId;

  @Prop({ index: true, unique: true })
  adAccountName: string;

  @Prop({ type: MongooseSchema.Types.Number, default: 0 })
  order: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Organization',
  })
  organizationId?: Types.ObjectId;
}
export const AdAccountSchema = SchemaFactory.createForClass(AdAccount);
