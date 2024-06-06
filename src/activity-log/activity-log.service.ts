import { Injectable } from '@nestjs/common';
import { ActivityLogsRepository } from './activity-log.repository';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { ActivityLog } from './schemas/activity-log.schema';
import { PagingOptions } from './types/paging-options.types';
import { Types } from 'mongoose';
import { SearchQuery } from './dto/search-query.dto';
import { UserAuthInfo } from '../users/interface/user.interface';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class ActivityLogService {
  constructor(private activityLogsRepository: ActivityLogsRepository) {}

  async saveActivityLog(
    createActivity: CreateActivityLogDto,
  ): Promise<ActivityLog> {
    try {
      return this.activityLogsRepository.create(createActivity);
    } catch (error) {
      throw error;
    }
  }

  async getActivityLogs(
    user: UserAuthInfo,
    pagination: PagingOptions,
    logged: User,
    query?: SearchQuery,
  ): Promise<ActivityLog[]> {
    const userId = user._id;

    // If the user is neither an admin nor a super admin
    if (!logged.isAdmin() && !logged.isSuperAdmin()) {
      return this.activityLogsRepository.find(
        { userId: new Types.ObjectId(userId) },
        pagination,
      );
    }

    // If the user is an admin
    if (logged.isAdmin() && logged?.organizationId) {
      const baseQuery =
        query.query && query.query !== ''
          ? { userId: new Types.ObjectId(query.query) }
          : {};

      // If the user belongs to an organization, add it to the query
      if (logged.organizationId) {
        baseQuery['organizationId'] = logged.organizationId;
      }

      return this.activityLogsRepository.find(baseQuery, pagination);
    }

    // If the user is a super admin
    if (logged.isSuperAdmin()) {
      const baseQuery =
        query.query && query.query !== ''
          ? { userId: new Types.ObjectId(query.query) }
          : {};

      return this.activityLogsRepository.find(baseQuery, pagination);
    }

    return [];
  }
}
