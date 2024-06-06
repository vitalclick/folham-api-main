import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';
import { MessageType } from '../types/device-log-message.type';

export type DeviceLogDocument = DeviceLog & Document;

@Schema({ timestamps: true })
export class DeviceLog {
  @Prop({
    type: MongooseSchema.Types.String,
  })
  adId: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'AdAccounts',
    index: true,
  })
  accountId: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Campaigns',
    index: true,
  })
  campaignId: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'AdScreen',
  })
  screenId: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.String,
    enum: MessageType,
    default: MessageType.play,
  })
  messageType: MessageType;

  @Prop({ type: MongooseSchema.Types.Date })
  loggedOn: Date;
}
export const DeviceLogSchema = SchemaFactory.createForClass(DeviceLog);
