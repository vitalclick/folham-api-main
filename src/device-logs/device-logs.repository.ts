import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import { PagingOptions } from '../activity-log/types/paging-options.types';
import { DeviceLog, DeviceLogDocument } from './schema/device-log.schema';

@Injectable()
export class DeviceLogsRepository {
  constructor(
    @InjectModel(DeviceLog.name)
    private model: Model<DeviceLogDocument>,
  ) {}

  public async create(DeviceLogDto): Promise<DeviceLogDocument> {
    return this.model.create(DeviceLogDto);
  }

  public async find(
    findQuery: FilterQuery<DeviceLogDocument>,
    pagination: PagingOptions,
  ): Promise<DeviceLog[]> {
    const data = await this.model.aggregate([
      {
        $match: findQuery,
      },
      { $sort: { loggedOn: -1 } },
      { $skip: pagination.skip ? pagination.skip : 0 },
      { $limit: pagination.limit ? pagination.limit : 100 },
      {
        $lookup: {
          from: 'campaigns',
          localField: 'campaignId',
          foreignField: '_id',
          as: 'campaign',
        },
      },
      {
        $unwind: {
          path: '$campaign',
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: 'adaccounts',
          localField: 'accountId',
          foreignField: '_id',
          as: 'adaccount',
        },
      },
      {
        $unwind: {
          path: '$adaccount',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'ads',
          let: { adid: { $first: '$campaign.adFiles' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', { $toObjectId: '$$adid' }] } } },
          ],
          as: 'adverts',
        },
      },
      {
        $unwind: {
          path: '$adverts',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'adscreens',
          localField: 'screenId',
          foreignField: '_id',
          as: 'screen',
        },
      },
      {
        $unwind: {
          path: '$screen',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          campaignName: '$campaign.name',
          adAccountName: '$adaccount.adAccountName',
          adFileName: { $first: '$adverts.adFile.adName' },
          adType: { $first: '$adverts.adFile.adType' },
          screenName: '$screen.name',
          screenIdName: '$screen.screenId',
        },
      },
      {
        $project: {
          accountId: 0,
          screen: 0,
          campaign: 0,
          _id: 0,
          createdAt: 0,
          updatedAt: 0,
          adaccount: 0,
          adverts: 0,
          adFileName: 0,
          adType: 0,
        },
      },
    ]);
    return data;
  }

  public async findAll(
    findQuery?: FilterQuery<DeviceLogDocument>,
    option?: any,
    extra?: any,
  ): Promise<DeviceLog[]> {
    return this.model.find(findQuery, option, extra).exec();
  }

  async countLogs(findQuery?: FilterQuery<DeviceLogDocument>) {
    const data = await this.model.aggregate([
      {
        $match: findQuery,
      },
      {
        $count: 'count',
      },
    ]);
    return data.length > 0 ? data[0]?.count : 0;
  }

  public async findOne(query: FilterQuery<DeviceLogDocument>) {
    return this.model.findOne(query);
  }

  findOneById(query: FilterQuery<DeviceLogDocument>) {
    return this.model.findById(query).exec();
  }

  public async updateOne(
    id: Types.ObjectId,
    updateQuery?: UpdateQuery<Partial<DeviceLogDocument>>,
  ): Promise<DeviceLogDocument> {
    return this.model.findOneAndUpdate({ _id: id }, updateQuery, {
      new: true,
    });
  }

  public async delete(query: FilterQuery<DeviceLogDocument>) {
    return this.model.findByIdAndDelete(query);
  }

  public async count(): Promise<number> {
    return this.model.countDocuments();
  }

  public async getLiveScreens(screenId: string): Promise<DeviceLogDocument> {
    return this.model
      .findOne({ screenId: new Types.ObjectId(screenId) })
      .sort({ createdAt: -1 });
  }

  public async deleteOldLogsBatched(batchSize = 1000): Promise<void> {
    // Calculate the date two months ago
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 1);

    const totalToDelete = await this.model.countDocuments({
      loggedOn: { $lt: twoMonthsAgo },
    });

    console.log(`Starting deletion of ${totalToDelete} documents.`);

    let deletedSoFar = 0;

    while (deletedSoFar < totalToDelete) {
      const documents = await this.model
        .find({ loggedOn: { $lt: twoMonthsAgo } })
        .limit(batchSize);

      const idsToDelete = documents.map((doc) => doc._id);

      const result = await this.model.deleteMany({ _id: { $in: idsToDelete } });

      deletedSoFar += result.deletedCount;

      console.log(`Deleted ${deletedSoFar} of ${totalToDelete} documents.`);
    }

    console.log('Deletion complete.');
  }
}
