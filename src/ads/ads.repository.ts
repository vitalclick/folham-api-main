import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions, Types, UpdateQuery } from 'mongoose';
import { Ads, AdsDocument } from './schema/ad.schema';
import { ICampaignsUsingAd } from './types/ads.type';

@Injectable()
export class AdsRepository {
  constructor(
    @InjectModel(Ads.name)
    private model: Model<AdsDocument>,
  ) {}

  public async create(adsDto): Promise<AdsDocument> {
    return this.model.create(adsDto);
  }

  public async find(
    user,
    findQuery?: FilterQuery<AdsDocument>,
    option?: QueryOptions,
    extra?: any,
  ): Promise<Ads[]> {
    const organizationId = user.organizationId;

    if (user.privilege == 'superAdmin') {
      return this.model
        .find(findQuery, option, extra)
        .sort({ order: -1 })
        .exec();
    }
    return this.model
      .find({ ...findQuery, organizationId }, option, extra)
      .sort({ order: -1 })
      .exec();
  }

  public async findOne(query: FilterQuery<AdsDocument>) {
    return this.model.findOne(query);
  }

  public async findAllAds(query: FilterQuery<AdsDocument>) {
    return this.model.find(query).where('adAccount');
  }

  findOneById(query: FilterQuery<AdsDocument>) {
    return this.model.findById(query).exec();
  }

  public async updateOne(
    id: string,
    updateQuery?: UpdateQuery<Partial<AdsDocument>>,
  ): Promise<AdsDocument> {
    return this.model.findOneAndUpdate({ _id: id }, updateQuery, {
      new: true,
    });
  }

  public async delete(query: FilterQuery<AdsDocument>) {
    return this.model.findByIdAndDelete(query);
  }

  public async count(findQuery?: FilterQuery<AdsDocument>): Promise<number> {
    return this.model.find(findQuery).count();
  }

  public async groupCampaignScheduleByAdScreen(adScreen) {
    return this.model.aggregate([
      { $group: { _id: adScreen, adAccounts: { $addToSet: '$adAccount' } } },
    ]);
  }

  async getAdImage(adAccount: string, adScreen: string) {
    return this.model.aggregate([
      { $unwind: '$adFile' },
      {
        $match: {
          adAccount: new Types.ObjectId(adAccount),
          adScreen: new Types.ObjectId(adScreen),
        },
      },
      { $project: { _id: 0, adFile: { adUrl: 1 } } },
    ]);
  }

  async getAdImages(adAccount: string) {
    return this.model.aggregate([
      { $unwind: '$adFile' },
      {
        $match: {
          adAccount: new Types.ObjectId(adAccount),
        },
      },
      { $project: { _id: 0, adFile: 1 } },
    ]);
  }

  async deleteMany(adAccount: string) {
    return this.model.deleteMany({ adAccount: new Types.ObjectId(adAccount) });
  }

  async getCampaignsUsingAds(adId: string, adAccount: string) {
    const campaigns: ICampaignsUsingAd[] = await this.model.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(adId),
          adAccount: new Types.ObjectId(adAccount),
        },
      },
      {
        $lookup: {
          from: 'campaigns',
          localField: 'adAccount',
          foreignField: 'adAccount',
          as: 'campaigns',
        },
      },
    ]);
    return campaigns;
  }
}
