import { AuthUser } from './../common/decorators/user.decorator';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActivityLogService } from './activity-log.service';
import { ActivityLogDto } from './dto/activity-log.dto';
import { SearchQuery } from './dto/search-query.dto';
import { ActivityLog } from './schemas/activity-log.schema';
import { PagingOptions } from './types/paging-options.types';
import { User } from '../users/schemas/user.schema';
import { UserAuthInfo } from '../users/interface/user.interface';

@ApiTags('activity-log')
@Controller()
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get('activity-logs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns the entire log of activities',
    type: [ActivityLogDto],
  })
  findAll(
    @AuthUser() user: UserAuthInfo,
    @Query() pagination: PagingOptions,
    @Query() searchQuery?: SearchQuery,
  ): Promise<ActivityLog[]> {
    const logged = new User(user as any);
    return this.activityLogService.getActivityLogs(
      user,
      pagination,
      logged,
      searchQuery,
    );
  }
}
