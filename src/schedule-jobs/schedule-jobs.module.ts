import { Module } from '@nestjs/common';
import { CampaignModule } from '../campaign/campaign.module';
import { DeviceLogsModule } from '../device-logs/device-logs.module';
import { WidgetsModule } from '../widgets/widgets.module';
import { ScheduleJobsService } from './schedule-jobs.service';

@Module({
  imports: [DeviceLogsModule, WidgetsModule, CampaignModule],
  providers: [ScheduleJobsService],
})
export class ScheduleJobsModule {}
