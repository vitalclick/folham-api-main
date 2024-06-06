import { Injectable } from '@nestjs/common';
import { SearchQuery } from '../activity-log/dto/search-query.dto';
import { PagingOptions } from '../activity-log/types/paging-options.types';
import { CampaignActivityRepository } from './campaign-activity.repository';
import { CreateCampaignActivityDto } from './dto/create-campaign-activity.dto';
import { CampaignActivity } from './schema/campaign-activity.schema';
import { Types } from 'mongoose';
import { UserAuthInfo } from '../users/interface/user.interface';
import { User } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class CampaignActivityService {
  constructor(
    private campaignActivityRepository: CampaignActivityRepository,
    private userService: UsersService,
  ) {}

  async saveCampaignActivity(
    createActivity: CreateCampaignActivityDto,
  ): Promise<CampaignActivity> {
    try {
      return this.campaignActivityRepository.create(createActivity);
    } catch (error) {
      throw error;
    }
  }

  async getCampaignActivities(
    user: UserAuthInfo,
    pagination: PagingOptions,
    loggedUser: User,
    query?: SearchQuery,
  ): Promise<CampaignActivity[]> {
    if (loggedUser.isSuperAdmin()) {
      if (query.query && query.query !== '') {
        return this.campaignActivityRepository.find(
          { userId: new Types.ObjectId(query.query) },
          pagination,
        );
      }
      return this.campaignActivityRepository.find({}, pagination);
    }

    // If user is admin but has no organization ID, return an empty array
    if (loggedUser.isAdmin() && !loggedUser.organizationId) {
      return [];
    }

    if (loggedUser.isAdmin()) {
      const users = await this.userService.getOrganizationUsers(
        loggedUser.organizationId.toHexString(),
      );
      const userIds = users.map((user) => user._id);
      if (query.query && query.query !== '') {
        return this.campaignActivityRepository.find(
          { userId: new Types.ObjectId(query.query) },
          pagination,
        );
      }
      return this.campaignActivityRepository.find(
        { userId: { $in: userIds } },
        pagination,
      );
    }

    return this.campaignActivityRepository.find(
      {
        userId: new Types.ObjectId(user._id),
      },
      pagination,
    );
  }
}
