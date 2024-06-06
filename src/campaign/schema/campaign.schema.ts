import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';
import { CampaignActiveStatus } from '../types/campaign.type';

export type CampaignDocument = Campaign & Document;

@Schema({ timestamps: true })
export class Campaign {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'AdAccount',
    index: true,
  })
  adAccount: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'AdScreen',
    index: true,
  })
  adScreen: Types.ObjectId;

  @Prop()
  name: string;

  // The date the campaign would be scheduled to start
  @Prop({
    type: MongooseSchema.Types.Date,
  })
  startDate: Date;

  // The date the campaign would be scheduled to end
  @Prop({
    type: MongooseSchema.Types.Date,
  })
  endDate: Date;

  // The time that the campaign with a video file would run for in seconds
  @Prop({
    type: MongooseSchema.Types.Number,
  })
  videoAndImageDuration: number;

  // The hours during the 24hour period the campaign would be scheduled to run
  @Prop()
  startTime: string;

  // The hours during the 24hour period the campaign would be scheduled to run
  @Prop()
  endTime: string;

  // Days of the week in their 3 letter format (Mon, Tue, Wed, etc)
  @Prop({
    type: [MongooseSchema.Types.String],
  })
  campaignScheduleDays: [string];

  @Prop({ type: MongooseSchema.Types.Number, default: 0 })
  campaignActiveStatus: CampaignActiveStatus;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Ads' })
  adFiles: Types.ObjectId[];

  @Prop({ type: MongooseSchema.Types.Number })
  order: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Organization',
  })
  organizationId?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.Number, default: 1 })
  screenViewPort = 1;
}
export const CampaignSchema = SchemaFactory.createForClass(Campaign);
