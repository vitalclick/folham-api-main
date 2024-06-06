import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DateTime } from 'luxon';
import { FilterQuery, Model, QueryOptions, Types, UpdateQuery } from 'mongoose';
import {
  ICampaignDetailsAggregate,
  IPublicAdvertAggregate,
} from './dto/update-campaign.dto';
import { Campaign, CampaignDocument } from './schema/campaign.schema';
import { CampaignNotificationSchemaFilter } from './types/campaign.type';

@Injectable()
export class CampaignRepository {
  constructor(
    @InjectModel(Campaign.name)
    private model: Model<CampaignDocument>,
  ) {}

  public async create(campaignDto): Promise<CampaignDocument> {
    return this.model.create(campaignDto);
  }

  public async find(
    user,
    findQuery?: FilterQuery<CampaignDocument>,
    option?: QueryOptions,
    extra?: any,
  ): Promise<Campaign[]> {
    if (user.privilege === 'admin' || user.privilege === 'superAdmin') {
      return this.model
        .find(findQuery, option, extra)
        .sort({ order: 1 })
        .exec();
    }
    return this.model
      .find(
        { ...findQuery, organizationId: user.organizationId },
        option,
        extra,
      )
      .sort({ order: 1 })
      .exec();
  }

  public async findOne(query: FilterQuery<CampaignDocument>) {
    const campaign = await this.model.findOne(query);
    return campaign;
  }

  public async findOneCampaign(query: FilterQuery<CampaignDocument>, sort) {
    return this.model.findOne(query).sort(sort);
  }

  findOneById(query: FilterQuery<CampaignDocument>) {
    return this.model.findOne(query);
  }
  // async findOneWithMinimalDetails(query: FilterQuery<CampaignDocument>) {
  //   return this.model.aggregate([{ $match: query },{}]);
  // }

  public async updateOne(
    id: Types.ObjectId,
    updateQuery?: UpdateQuery<Partial<CampaignDocument>>,
  ): Promise<CampaignDocument> {
    return this.model.findOneAndUpdate({ _id: id }, updateQuery, {
      new: true,
    });
  }

  public async delete(query: FilterQuery<CampaignDocument>) {
    return this.model.deleteOne(query);
  }

  public async count(
    findQuery?: FilterQuery<CampaignDocument>,
  ): Promise<number> {
    const data = await this.model.aggregate([
      {
        $match: {
          ...findQuery,
        },
      },
      {
        $count: 'count',
      },
    ]);
    return data.length > 0 ? data[0]?.count : 0;
  }

  public async campaignAdScreenAndAccount(adScreen) {
    return this.model.aggregate([
      { $match: { adScreen: adScreen } },
      { $project: { adAccount: 1, adScreen: 1, order: 1 } },
      {
        $sort: {
          order: 1,
        },
      },
    ]);
  }

  public async countActiveCampaigns(findQuery?: FilterQuery<CampaignDocument>) {
    return this.model.aggregate([
      {
        $match: {
          ...findQuery,
        },
      },
      { $group: { _id: '$campaignActiveStatus', count: { $sum: 1 } } },
    ]);
  }

  public async countCampaignType() {
    return this.model.aggregate([
      { $group: { _id: '$campaignType', count: { $sum: 1 } } },
    ]);
  }

  public async countAllCampaignType() {
    return this.model.aggregate([
      {
        $group: {
          _id: null,
          totalActiveCampaigns: {
            $sum: { $cond: [{ $eq: ['$status', 'activated'] }, 1, 0] },
          },
          totalImageCampaigns: {
            $sum: { $cond: [{ $eq: ['$status', 'image'] }, 1, 0] },
          },
          totalvideoCampaigns: {
            $sum: { $cond: [{ $eq: ['$status', 'video'] }, 1, 0] },
          },
        },
      },
    ]);
  }

  public async groupCampaignSchedule() {
    return this.model.aggregate([
      {
        $group: { _id: '$_id', adAccounts: { $addToSet: '$adAccount' } },
      },
      {
        $sort: {
          order: 1,
        },
      },
    ]);
  }

  public async getCampaignAndAdverts(
    id: string,
  ): Promise<ICampaignDetailsAggregate> {
    const data = await this.model.aggregate([
      { $match: { _id: new Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'ads',
          localField: 'adAccount',
          foreignField: 'adAccount',
          as: 'ads',
        },
      },
      {
        $addFields: {
          adverts: '$ads.adFile',
        },
      },
      {
        $project: {
          ads: 0,
        },
      },
    ]);
    return data[0];
  }

  public async groupAdAccountByAdScreen(adScreen: string) {
    return this.model.aggregate([
      { $match: { adScreen: new Types.ObjectId(adScreen) } },
      {
        $lookup: {
          from: 'ads',
          localField: 'adAccount',
          foreignField: 'adAccount',
          let: { adScreen: '$adScreen' },
          pipeline: [
            {
              $match: {
                $expr: { $and: [{ $eq: ['$adScreen', '$$adScreen'] }] },
              },
            },
          ],
          as: 'ads',
        },
      },
      {
        $unwind: {
          path: '$ads',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          adverts: '$ads.adFile',
        },
      },
      {
        $lookup: {
          from: 'adaccounts',
          localField: 'adAccount',
          foreignField: '_id',
          as: 'adAccount',
        },
      },
      {
        $unwind: {
          path: '$adAccount',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          ads: 0,
        },
      },
      {
        $sort: {
          order: 1,
        },
      },
    ]);
  }

  public async getAdsConfiguration(adScreen: string) {
    return this.model
      .find(
        { adScreen: new Types.ObjectId(adScreen) },
        {
          _id: 1,
          adScreen: 1,
          adAccount: 1,
          startTime: 1,
          endTime: 1,
          startDate: 1,
          endDate: 1,
          campaignScheduleDays: 1,
          videoAndImageDuration: 1,
        },
      )
      .sort({ order: 1 });
  }

  public async getAdsAccountConfiguration(
    adAccount: string,
  ): Promise<IPublicAdvertAggregate[]> {
    const result = await this.model.aggregate([
      {
        $match: {
          adAccount: new Types.ObjectId(adAccount),
          startDate: { $lte: new Date() },
          endDate: { $gte: new Date() },
        },
      },
      {
        $unwind: {
          path: '$adFiles',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'ads',
          localField: 'adFiles',
          foreignField: '_id',
          as: 'adFiles',
        },
      },
      {
        $unwind: {
          path: '$adFiles',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          adFile: { $first: '$adFiles.adFile' },
          screenViewPort: { $ifNull: ['$screenViewPort', 1] },
        },
      },
      {
        $sort: {
          screenViewPort: 1,
        },
      },
      {
        $project: {
          _id: 1,
          adScreen: 1,
          adAccount: 1,
          startTime: 1,
          endTime: 1,
          startDate: 1,
          endDate: 1,
          campaignScheduleDays: 1,
          videoAndImageDuration: 1,
          adFile: 1,
          screenViewPort: 1,
        },
      },
    ]);
    // console.log('result @@', result);
    return result;
  }

  public async countCampaignsByAdAccount(adAccount) {
    return this.model.find({ adAccount: adAccount }).count();
  }

  public async getCampaignsByAdAccount(adAccount) {
    return this.model.find({ adAccount: adAccount });
  }

  async deleteMany(adScreen) {
    return this.model.deleteMany({ adScreen: new Types.ObjectId(adScreen) });
  }
  public async findCampaignStartingWithinTheNext12Hours() {
    const endTime = DateTime.now().plus({ hours: 12 });
    const startTime = DateTime.now();

    return this.model.aggregate([
      {
        $match: {
          startDate: { $gte: startTime.toJSDate(), $lte: endTime.toJSDate() },
        },
      },
      ...CampaignNotificationSchemaFilter,
    ]);
  }

  public async findCampaignExpiringWithinTheNext24Hours() {
    const endTime = DateTime.now().plus({ hours: 24 });
    const startTime = DateTime.now();
    return this.model.aggregate([
      {
        $match: {
          endDate: { $gte: startTime.toJSDate(), $lte: endTime.toJSDate() },
        },
      },
      ...CampaignNotificationSchemaFilter,
    ]);
  }
}
