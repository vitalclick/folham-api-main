import { Types } from 'mongoose';

export interface ScreenDetails {
  id: string;
  screenId: string;
  deviceId: string;
  name: string;
  sendEmailNotification: boolean;
  organizationId: Types.ObjectId;
}
