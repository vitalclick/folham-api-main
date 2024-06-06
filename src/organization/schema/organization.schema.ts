import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';

export type OrganizationDocument = Organization & Document;

@Schema({ timestamps: true, strict: false })
export class Organization {
  @Prop({
    type: MongooseSchema.Types.String,
    index: true,
  })
  name: string;
}
export const OrganizationSchema = SchemaFactory.createForClass(Organization);
