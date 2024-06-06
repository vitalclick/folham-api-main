import { Organization } from './../../organization/schema/organization.schema';
import { Types } from 'mongoose';

export interface UserAuthInfo {
  _id: string;
  userActiveStatus: number;
  username: string;
  organizationId: string;
  type: string;
  phoneNumber: string;
  lastName: string;
  firstName: string;
  email: string;
  privilege: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}
