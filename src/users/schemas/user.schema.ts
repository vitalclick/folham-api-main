import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { UserActiveStatus } from '../users.service';
import { UserType, AdminAccess } from '../types/users.types';

export type UserDocument = User & Document;

@Schema({ timestamps: true, strict: false })
export class User {
  constructor(obj?: Partial<User>) {
    if (obj) {
      Object.assign(this, obj);
    }
  }

  @Prop({ type: MongooseSchema.Types.String, required: true })
  firstName: string;

  @Prop({ type: MongooseSchema.Types.String, required: true })
  lastName: string;

  @Prop()
  email: string;

  @Prop({ select: false })
  hash?: string;

  @Prop({ select: false })
  salt?: string;

  @Prop({ type: MongooseSchema.Types.Number, default: 1 })
  userActiveStatus: UserActiveStatus;

  @Prop({
    type: MongooseSchema.Types.String,
    enum: UserType,
    default: UserType.individual,
  })
  type: UserType;

  @Prop({
    type: MongooseSchema.Types.String,
    enum: AdminAccess,
    default: AdminAccess.user,
  })
  privilege: AdminAccess;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Organization',
  })
  organizationId?: Types.ObjectId;

  isOrganizationOwner(organizationId: Types.ObjectId): boolean {
    if (this.isAdmin()) {
      return this.organizationId
        ? this.organizationId?.toHexString() === organizationId.toHexString()
        : false;
    }
    if (organizationId && this.organizationId) {
      return this.organizationId.toHexString() === organizationId.toHexString();
    }
    return false;
  }

  isAdmin(): boolean {
    return this.privilege === AdminAccess.admin;
  }
  isSuperAdmin(): boolean {
    if (this.privilege === AdminAccess.folhamAdmin) {
      return true;
    }
    return this.privilege === AdminAccess.superAdmin;
  }
}
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.methods.isOrganizationOwner = User.prototype.isOrganizationOwner;
UserSchema.methods.isAdmin = User.prototype.isAdmin;
