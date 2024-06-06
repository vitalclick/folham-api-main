import { FilterQuery, Model, QueryOptions, UpdateQuery } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ActivityLog,
  ActivityLogDocument,
} from './schemas/activity-log.schema';
import { PagingOptions } from './types/paging-options.types';

@Injectable()
export class ActivityLogsRepository {
  constructor(
    @InjectModel(ActivityLog.name) private model: Model<ActivityLogDocument>,
  ) {}

  async create(createActivityLogDto): Promise<ActivityLog> {
    let activityLog;
    try {
      activityLog = this.model.create(createActivityLogDto);
    } catch (err) {
      console.log(err);
    }
    return activityLog;
  }

  async find(
    findQuery: FilterQuery<ActivityLogDocument>,
    pagination: PagingOptions,
  ): Promise<ActivityLog[]> {
    return this.model
      .find(findQuery)
      .sort({ createdAt: -1 })
      .skip(pagination.skip ? pagination.skip : 0)
      .limit(pagination.limit ? pagination.limit : 200);
  }

  async findAll(
    findQuery?: FilterQuery<ActivityLogDocument>,
    option?: any,
    extra?: any,
  ): Promise<ActivityLog[]> {
    return this.model.find(findQuery, option, extra).exec();
  }

  async findOne(query, populate?: any): Promise<ActivityLog> {
    return this.model
      .findOne(query)
      .populate(populate?.key, populate?.value)
      .lean();
  }

  async findById(userId: string): Promise<ActivityLog | undefined> {
    return this.model.findById(userId);
  }

  async saveActivityLog(activityLog: any): Promise<ActivityLog> {
    return activityLog.save();
  }

  public async findByIdAndUpdate(
    id: string,
    updateQuery: UpdateQuery<ActivityLogDocument>,
    option?: QueryOptions,
  ): Promise<ActivityLog> {
    return this.model.findByIdAndUpdate(id, updateQuery, option);
  }

  // async validatePagingOptions(pagingOptions: PagingOptions) {
  //   let { page, limit } = pagingOptions;
  //   if (!page || page <= 0) page = 1;
  //   if (!limit || limit <= 100) limit = 100;
  //   return { page, limit };
  // }
}
