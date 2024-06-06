import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PagingOptions } from '../activity-log/types/paging-options.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../common/decorators/user.decorator';
import { DeviceLogsService } from './device-logs.service';
import { DeviceLogDto } from './dto/device-log.dto';
import { DeviceSearchQuery } from './dto/device-search-query.dto';
import { DeviceLog } from './schema/device-log.schema';
import { UserAuthInfo } from '../users/interface/user.interface';

@ApiTags('device-logs')
@Controller('device-logs')
export class DeviceLogsController {
  constructor(
    private readonly deviceLogsService: DeviceLogsService, // private queueService: QueueService,
  ) {}

  @Get('logs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns the entire log of activities',
    type: [DeviceLogDto],
  })
  findAll(
    @AuthUser() user: UserAuthInfo,
    @Query() deviceSearchQuery: DeviceSearchQuery,
    @Query() pagination: PagingOptions,
  ): Promise<DeviceLog[]> {
    return this.deviceLogsService.getDeviceLogs(
      user,
      pagination,
      deviceSearchQuery,
    );
  }

  @Get('campaign-history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns the entire log of campaign history',
  })
  async returnAllCampaignHistory(@Query() pagination: PagingOptions) {
    return this.deviceLogsService.getCampaignHistory(pagination);
  }

  @Get('campaign-played/count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns the number of times a campaign has been played',
  })
  async returnCampaignPlayedCount(@AuthUser() user: UserAuthInfo) {
    return this.deviceLogsService.getTotalCampaignPlayedTimes(user);
  }

  // @Get('screen/screen-status')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  // @ApiOkResponse({
  //   description:
  //     'Returns the status of deployed screens online/offline/initial',
  // })
  // async returnAliveScreenStatus(@AuthUser() user: UserAuthInfo) {
  //   return this.deviceLogsService.getScreenStatus(user);
  // }

  @Get('total-log-count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns the total number of logs',
  })
  async returnTotalLogCount() {
    return this.deviceLogsService.logsCount();
  }

  @Get('live-screen/')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns whether the screen is online or offline',
  })
  async returnLiveScreen(@AuthUser() user: UserAuthInfo) {
    return this.deviceLogsService.getScreenStatus(user, false);
  }

  @Get('delete-old-logs')
  async deleteOldLogs() {
    return this.deviceLogsService.deleteOldLogs();
  }
}
