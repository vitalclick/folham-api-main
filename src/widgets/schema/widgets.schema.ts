import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { WidgetType } from '../types/widget.type';

export type WidgetsDocument = Widgets & Document;

@Schema({ timestamps: true, strict: false })
export class Widgets {
  @Prop({ type: MongooseSchema.Types.String, index: true })
  widgetType: WidgetType;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'AdScreen', index: true })
  screenId: Types.ObjectId;
}
export const WidgetsSchema = SchemaFactory.createForClass(Widgets);
