import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AdType } from '../types/ads.type';

export type AdFileDocument = AdFile & Document;

@Schema({ timestamps: true, strict: false })
export default class AdFile {
  @Prop({
    enum: AdType,
    default: AdType.video,
  })
  adType: string;

  @Prop()
  adUrl: string;

  @Prop()
  adName: string;
}

export const AdFileSchema = SchemaFactory.createForClass(AdFile);
