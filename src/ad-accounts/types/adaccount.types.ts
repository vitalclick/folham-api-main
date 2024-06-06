import { Types } from 'mongoose';
import {
  Campaign,
  CampaignDocument,
} from '../../campaign/schema/campaign.schema';
import { AdAccount } from '../schema/ad-account.schema';

export interface IAdAccountSchedule {
  adAccount: AdAccount;
  adScreen: string;
  name: string;
  order: number;
  _id: string;
}

export interface IAdAccountCampaigns {
  name: string;
  adAccountName: string;
  order: 1;
  campaigns: CampaignDocument[];
  organizationId: Types.ObjectId;
}

export interface IAdAccountListedCampaigns {
  advertId: string;
  campaignId: string;
  campaignName: string;
  advertName: string;
  advertType: string;
  advertUrl: string;
}
