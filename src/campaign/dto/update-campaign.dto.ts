import { PartialType } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { CreateCampaignDto } from './create-campaign.dto';

export class UpdateCampaignDto extends PartialType(CreateCampaignDto) {}

export interface IPublicAdvertAggregate {
  _id: Types.ObjectId;
  adScreen: Types.ObjectId;
  adAccount: Types.ObjectId;
  startTime: string;
  endTime: string;
  startDate: Date;
  endDate: Date;
  campaignScheduleDays: string[];
  videoAndImageDuration: number;
  screenViewPort: number;
  adFile: {
    adType: string;
    video: string;
    adName: string;
    adUrl: string;
  };
}
export interface ICampaignDetailsAggregate {
  _id: Types.ObjectId;
  adAccount: Types.ObjectId;
  adScreen: Types.ObjectId;
  name: string;
  startDate: Date;
  endDate: Date;
  videoAndImageDuration: number;
  startTime: string;
  endTime: string;
  campaignScheduleDays: string[];
  adverts: any[];
  createdAt: Date;
  updatedAt: Date;
}
