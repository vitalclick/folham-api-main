import { Module, forwardRef } from '@nestjs/common';
import { DeviceLogsService } from './device-logs.service';
import { DeviceLogsController } from './device-logs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { DeviceLog, DeviceLogSchema } from './schema/device-log.schema';
import { DeviceLogsRepository } from './device-logs.repository';
import { CampaignModule } from '../campaign/campaign.module';
import { AdAccountModule } from '../ad-accounts/ad-accounts.module';
import { QueuesModule } from '../queues/queues.module';
import { AdScreenModule } from '../ad-screens/ad-screens.module';
import { CommonModule } from '../common/common.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: DeviceLog.name,
        schema: DeviceLogSchema,
      },
    ]),
    ActivityLogModule,
    forwardRef(() => CampaignModule),
    forwardRef(() => AdAccountModule),
    forwardRef(() => QueuesModule),
    AdScreenModule,
    forwardRef(() => CommonModule),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [DeviceLogsController],
  providers: [DeviceLogsService, DeviceLogsRepository],
  exports: [DeviceLogsService, DeviceLogsRepository],
})
export class DeviceLogsModule {}
