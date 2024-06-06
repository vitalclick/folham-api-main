import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { SocialNetworkType } from '../types/users.types';

export type SocialNetworkDocument = SocialNetworks & Document;

@Schema({ _id: false })
@Schema({ timestamps: true, strict: false })
export default class SocialNetworks {
  @Prop({ type: MongooseSchema.Types.String, enum: SocialNetworkType })
  name: SocialNetworkType;

  @Prop()
  url: string;

  @Prop({ default: true })
  visible: boolean;
}

export const SocialNetworkSchema = SchemaFactory.createForClass(SocialNetworks);
