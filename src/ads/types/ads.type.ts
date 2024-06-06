import { ObjectId, Types } from 'mongoose';

export enum AdType {
  video = 'video',
  picture = 'picture',
  vast = 'vast',
  html = 'Html-tags',
}

export interface ICampaignsUsingAd {
  _id: Types.ObjectId;
  adAccount: Types.ObjectId;
  adFile: [];
  campaigns: ICampaign[];
}

export interface ICampaign {
  _id: Types.ObjectId;
  adAccount: Types.ObjectId;
  adScreen: Types.ObjectId;
  name: string;
  startDate: Date;
  endDate: Date;
  videoAndImageDuration: number;
  startTime: string;
  endTime: string;
  campaignScheduleDays: [];
  campaignActiveStatus: number;
  adFiles: Types.ObjectId[];
}
