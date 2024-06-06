import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';

export type CampaignActivityDocument = CampaignActivity & Document;

@Schema({ timestamps: true, strict: false })
export class CampaignActivity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', index: true })
  userId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Campaign', index: true })
  campaignId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.String, required: true })
  message: string;

  @Prop({ type: MongooseSchema.Types.Date, default: Date.now })
  createdAt: Date;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Organization',
  })
  organizationId: Types.ObjectId;
}
export const CampaignActivitySchema =
  SchemaFactory.createForClass(CampaignActivity);
