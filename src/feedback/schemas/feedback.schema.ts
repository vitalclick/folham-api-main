import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { FeedbackType } from '../../common/enums/feedback.enum';

export type FeedbackDocument = Feedback & Document;

@Schema({ timestamps: true })
export class Feedback {
  @Prop({ type: MongooseSchema.Types.String })
  firstName: string;

  @Prop({ type: MongooseSchema.Types.String })
  lastName: string;

  @Prop({ type: MongooseSchema.Types.String })
  email: string;

  @Prop({ type: MongooseSchema.Types.String })
  message: string;

  @Prop({
    type: MongooseSchema.Types.String,
    enum: Object.values(FeedbackType),
    default: FeedbackType.support,
    index: true,
  })
  type: FeedbackType;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
