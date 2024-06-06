import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { FilterQuery, Model, QueryOptions, Types, UpdateQuery } from 'mongoose';
import {
  ScrollingAds,
  ScrollingAdsDocument,
} from './schema/scrolling-ads.schema';

@Injectable()
export class ScrollingAdsRepository {
  constructor(
    @InjectModel(ScrollingAds.name)
    private model: Model<ScrollingAdsDocument>,
  ) {}

  public async create(scrollingAdsDto): Promise<ScrollingAdsDocument> {
    return this.model.create(scrollingAdsDto);
  }

  public async find(
    findQuery?: FilterQuery<ScrollingAdsDocument>,
    option?: QueryOptions,
    extra?: any,
  ): Promise<ScrollingAdsDocument[]> {
    return this.model
      .find(findQuery, option, extra)
      .sort({ createdAt: 1 })
      .exec();
  }

  public async findOne(query: FilterQuery<ScrollingAdsDocument>) {
    const scrollingAds = await this.model.findOne(query);
    return scrollingAds;
  }

  public async findOneScrollingAds(query: FilterQuery<ScrollingAdsDocument>) {
    return this.model.findOne(query);
  }

  findOneById(query: FilterQuery<ScrollingAdsDocument>) {
    return this.model.findOne(query);
  }

  async getAllScrollingAdsDetailsByScreenId(screenIds: string[]): Promise<any> {
    const screenIdList = screenIds.map((id) => new Types.ObjectId(id));
    const aggregationResult = await this.model.aggregate([
      {
        $match: {
          screenIds: { $in: screenIdList },
        },
      },
      {
        $lookup: {
          from: 'contentdetails',
          localField: '_id',
          foreignField: 'scrollingAdId',
          as: 'contentDetails',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          type: 1,
          isActive: 1,
          startTime: 1,
          endTime: 1,
          contentDetails: {
            $map: {
              input: '$contentDetails',
              as: 'cd',
              in: '$$cd.message',
            },
          },
        },
      },
    ]);

    return aggregationResult;
  }

  public async updateOne(
    id: Types.ObjectId,
    updateQuery?: UpdateQuery<Partial<ScrollingAdsDocument>>,
  ): Promise<ScrollingAdsDocument> {
    return this.model.findOneAndUpdate({ _id: id }, updateQuery, {
      new: true,
    });
  }

  public async delete(query: FilterQuery<ScrollingAdsDocument>) {
    return this.model.findByIdAndDelete(query);
  }

  public async deleteMany(query: FilterQuery<ScrollingAdsDocument>) {
    return this.model.deleteMany(query);
  }
}
