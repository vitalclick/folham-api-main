import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type FlexLayoutDocument = FlexLayout & Document;

@Schema({ _id: false })
@Schema({ timestamps: true, strict: false })
export default class FlexLayout {
  @Prop()
  order: number;

  @Prop()
  flex: number;
}

export const FlexLayoutSchema = SchemaFactory.createForClass(FlexLayout);
