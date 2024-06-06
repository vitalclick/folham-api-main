import { Module, forwardRef } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { ActivityLogController } from './activity-log.controller';
import { ActivityLog, ActivityLogSchema } from './schemas/activity-log.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityLogsRepository } from './activity-log.repository';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ActivityLog.name,
        schema: ActivityLogSchema,
      },
    ]),
  ],
  controllers: [ActivityLogController],
  providers: [ActivityLogService, ActivityLogsRepository],
  exports: [ActivityLogService],
})
export class ActivityLogModule {}
