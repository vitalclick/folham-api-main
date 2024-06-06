import { FilterQuery, Model, QueryOptions, UpdateQuery } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CampaignActivity,
  CampaignActivityDocument,
} from './schema/campaign-activity.schema';
import { PagingOptions } from '../activity-log/types/paging-options.types';

@Injectable()
export class CampaignActivityRepository {
  constructor(
    @InjectModel(CampaignActivity.name)
    private model: Model<CampaignActivityDocument>,
  ) {}

  async create(createCampaignActivityDto): Promise<CampaignActivity> {
    let campaignActivity;
    try {
      campaignActivity = this.model.create(createCampaignActivityDto);
    } catch (err) {
      console.log(err);
    }
    return campaignActivity;
  }

  async find(
    findQuery: FilterQuery<CampaignActivityDocument>,
    pagination: PagingOptions,
  ): Promise<CampaignActivity[]> {
    return this.model
      .find(findQuery)
      .skip(pagination.skip ? pagination.skip : 0)
      .limit(pagination.limit ? pagination.limit : 200)
      .lean()
      .sort({ createdAt: -1 });
  }

  async findAll(
    findQuery?: FilterQuery<CampaignActivityDocument>,
    option?: any,
    extra?: any,
  ): Promise<CampaignActivity[]> {
    return this.model.find(findQuery, option, extra).exec();
  }

  async findOne(query, populate?: any): Promise<CampaignActivity> {
    return this.model
      .findOne(query)
      .populate(populate?.key, populate?.value)
      .lean();
  }

  async findById(userId: string): Promise<CampaignActivity | undefined> {
    return this.model.findById(userId);
  }

  async saveCampaignActivity(campaignActivity: any): Promise<CampaignActivity> {
    return campaignActivity.save();
  }

  public async findByIdAndUpdate(
    id: string,
    updateQuery: UpdateQuery<CampaignActivityDocument>,
    option?: QueryOptions,
  ): Promise<CampaignActivity> {
    return this.model.findByIdAndUpdate(id, updateQuery, option);
  }
}
