import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions, Types, UpdateQuery } from 'mongoose';
import { AdAccount, AdAccountDocument } from './schema/ad-account.schema';
import { IAdAccountCampaigns } from './types/adaccount.types';

@Injectable()
export class AdAccountRepository {
  constructor(
    @InjectModel(AdAccount.name)
    private model: Model<AdAccountDocument>,
  ) {}

  public async create(adAccountDto): Promise<AdAccountDocument> {
    return this.model.create(adAccountDto);
  }

  public async find(
    findQuery?: FilterQuery<AdAccountDocument>,
    option?: QueryOptions,
    extra?: any,
  ): Promise<AdAccountDocument[]> {
    return this.model.find(findQuery, option, extra).sort({ order: -1 }).exec();
  }

  public async findOne(query: FilterQuery<AdAccountDocument>) {
    return this.model.findOne(query);
  }

  async getCampaignsByAdAccount(
    adAccount: string,
  ): Promise<IAdAccountCampaigns> {
    const data = await this.model.aggregate([
      { $match: { _id: new Types.ObjectId(adAccount) } },
      {
        $lookup: {
          from: 'campaigns',
          localField: '_id',
          foreignField: 'adAccount',
          as: 'campaigns',
        },
      },
      {
        $project: {
          name: 1,
          adAccountName: 1,
          order: 1,
          campaigns: 1,
          organizationId: 1,
        },
      },
    ]);
    return data[0];
  }

  findOneById(query: FilterQuery<AdAccountDocument>) {
    return this.model.findOne(query);
  }

  public async updateOne(
    id: string,
    updateQuery?: UpdateQuery<Partial<AdAccountDocument>>,
  ): Promise<AdAccountDocument> {
    return this.model.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      updateQuery,
      {
        new: true,
      },
    );
  }

  public async delete(query: FilterQuery<AdAccountDocument>) {
    const data = await this.model.findOne(query);
    await data.delete();
    return data;
  }

  async findAdaccountScheduleByScreen(query: FilterQuery<AdAccountDocument>) {
    return this.model.aggregate([
      { $match: query },
      {
        $sort: {
          order: 1,
        },
      },
      // {
      //   $lookup: {
      //     from: 'campaigns',
      //     localField: '_id',
      //     foreignField: 'adAccount',
      //     as: 'campaigns',
      //   },
      // },
      // {
      //   $project: {
      //     name: 1,
      //     adAccountName: 1,
      //     order: 1,
      //     campaigns: 1,
      //     organizationId: 1,
      //   },
      // },
    ]);
  }

  async findAdaccountScheduleByScreenWithViewort(
    query: FilterQuery<AdAccountDocument>,
  ) {
    const result = await this.model.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'campaigns',
          localField: '_id',
          foreignField: 'adAccount',
          as: 'campaigns',
        },
      },
      {
        $unwind: { path: '$campaigns', preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          'campaigns.screenViewPort': {
            $ifNull: ['$campaigns.screenViewPort', 1],
          },
        },
      },
      {
        $group: {
          _id: {
            screenViewPort: '$campaigns.screenViewPort',
            adAccountId: '$_id',
          },
          adAccount: { $first: '$$ROOT' },
        },
      },
      {
        $group: {
          _id: '$_id.screenViewPort',
          adAccounts: {
            $push: {
              adAccount: '$adAccount',
              adScreen: '$adAccount.adScreen',
              name: '$adAccount.name',
              order: '$adAccount.order',
              _id: '$adAccount._id',
            },
          },
        },
      },
      {
        $project: {
          screenViewPort: '$_id',
          _id: 0,
          accounts: {
            $map: {
              input: '$adAccounts',
              as: 'account',
              in: {
                adAccount: '$$account.adAccount',
                adScreen: '$$account.adScreen',
                name: '$$account.name',
                order: '$$account.order',
                _id: '$$account._id',
              },
            },
          },
        },
      },
    ]);
    return result;
  }

  public async findOneAdAccount(query: FilterQuery<AdAccountDocument>, sort) {
    return this.model.findOne(query).sort(sort);
  }

  public async findAdAccountsByAdCompany(adCompany) {
    return this.model.find({ adCompany: adCompany });
  }

  public async getOnlyAdaccountsOnScreen(adScreen: string) {
    return this.model.aggregate([
      { $match: { adScreen: new Types.ObjectId(adScreen) } },
    ]);
  }

  public async getAdAccountsRelatedToScreen(adScreen) {
    return this.model.aggregate([
      { $match: { adScreen: adScreen } },
      {
        $lookup: {
          from: 'campaigns',
          localField: '_id',
          foreignField: 'adAccount',
          as: 'campaigns',
        },
      },
      {
        $lookup: {
          from: 'ads',
          localField: '_id',
          foreignField: 'adAccount',
          // let: { adScreen: '$adScreen' },
          // pipeline: [
          //   {
          //     $match: {
          //       $expr: { $and: [{ $eq: ['$adScreen', '$$adScreen'] }] },
          //     },
          //   },
          // ],
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

  public async campaignSchedule(adScreen) {
    return this.model.aggregate([
      { $match: { adScreen: adScreen } },
      {
        $lookup: {
          from: 'campaigns',
          let: { adAccount: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $and: [{ $eq: ['$adAccount', '$$adAccount'] }] },
              },
            },
            { $project: { adAccount: 1, order: 1 } },
          ],
          as: 'campaigns',
        },
      },
      { $project: { adAccount: 1, order: 1 } },
      {
        $sort: {
          order: 1,
        },
      },
    ]);
  }

  public async retrieveAdScreen(query: FilterQuery<AdAccountDocument>) {
    return this.model.findOne(query);
  }

  async deleteMany(adScreen: string) {
    return this.model.deleteMany({ adScreen: new Types.ObjectId(adScreen) });
  }
}
