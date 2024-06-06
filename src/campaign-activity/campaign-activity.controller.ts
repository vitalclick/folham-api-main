import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SearchQuery } from '../activity-log/dto/search-query.dto';
import { PagingOptions } from '../activity-log/types/paging-options.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../common/decorators/user.decorator';
import { CampaignActivityService } from './campaign-activity.service';
import { CampaignActivityDto } from './dto/campaign-activity.dto';
import { CampaignActivity } from './schema/campaign-activity.schema';
import { User } from '../users/schemas/user.schema';

@ApiTags('campaign-activity')
@Controller('campaign-activity')
export class CampaignActivityController {
  constructor(
    private readonly campaignActivityService: CampaignActivityService,
  ) {}

  @Get('activities')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns the entire log of campaign activities',
    type: [CampaignActivityDto],
  })
  findAll(
    @AuthUser() user,
    @Query() pagination: PagingOptions,
    @Query() searchQuery?: SearchQuery,
  ): Promise<CampaignActivity[]> {
    const loggedUser = new User(user as any);
    return this.campaignActivityService.getCampaignActivities(
      user,
      pagination,
      loggedUser,
      searchQuery,
    );
  }
}
