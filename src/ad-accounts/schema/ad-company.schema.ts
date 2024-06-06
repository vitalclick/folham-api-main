import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document, Types } from 'mongoose';

export type AdCompanyDocument = AdCompany & Document;

export enum CompanyActiveStatus {
  activated = 0,
  deactivated = 1,
  deleted = 2,
}
@Schema({ timestamps: true })
export class AdCompany {
  @Prop({ index: true, unique: true })
  companyName: string;

  @Prop()
  companyEmail?: string;

  @Prop()
  companyAbbreviation: string;

  @Prop()
  adAccountManager: string;

  @Prop()
  adAccountManagerEmail: string;

  @Prop()
  adAccountManagerPhoneNumber: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    index: true,
  })
  accountServiceManagerId: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.Number,
    default: CompanyActiveStatus.deactivated,
  })
  companyActiveStatus: CompanyActiveStatus;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Organization',
  })
  organizationId?: Types.ObjectId;
}
export const AdCompanySchema = SchemaFactory.createForClass(AdCompany);
