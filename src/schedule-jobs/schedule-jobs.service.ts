import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WidgetsService } from '../widgets/widgets.service';
import { DeviceLogsService } from '../device-logs/device-logs.service';
import { CampaignService } from '../campaign/campaign.service';

@Injectable()
export class ScheduleJobsService {
  constructor(
    private widgetService: WidgetsService,
    private campaignService: CampaignService,
    private deviceLogsService: DeviceLogsService,
  ) {}

  private readonly logger = new Logger(ScheduleJobsService.name);

  @Cron('0 */3 * * * *') // Every 3 minutes
  updateScreenStatus() {
    this.deviceLogsService.getScreenStatus(null, true);
    this.logger.debug('Calls get screen status process');
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  getScreenLiveWeatherReport() {
    this.widgetService.updateLiveWeatherData();
    this.logger.debug('Calls get to screen live weather report process');
  }

  @Cron(CronExpression.EVERY_DAY_AT_2PM)
  sendCampaignExpiryEmail() {
    // if days left is less than 2, send email
    this.campaignService.processExpiredCampaigns();
    this.logger.debug('Cron for Campaign Expired Emails');
  }

  @Cron(CronExpression.EVERY_12_HOURS)
  sendCampaignStartEmail() {
    // if hours left before start is less than 12, send email
    this.campaignService.processCampaignsStartingToday();
    this.logger.debug('Cron for Campaign start Emails');
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  deleteLogGreaterThanTwoMonths() {
    // Run the method to delete logs older than 2 months
    this.deviceLogsService.deleteOldLogs();
    this.logger.debug('Cron to Delete Log Greater than 2 months');
  }
}
