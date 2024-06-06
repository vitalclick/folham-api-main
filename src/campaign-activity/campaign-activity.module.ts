import { Module } from '@nestjs/common';
import { CampaignActivityService } from './campaign-activity.service';
import { CampaignActivityController } from './campaign-activity.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CampaignActivity,
  CampaignActivitySchema,
} from './schema/campaign-activity.schema';
import { CampaignActivityRepository } from './campaign-activity.repository';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CampaignActivity.name,
        schema: CampaignActivitySchema,
      },
    ]),
    UsersModule,
  ],
  controllers: [CampaignActivityController],
  providers: [CampaignActivityService, CampaignActivityRepository],
  exports: [CampaignActivityService],
})
export class CampaignActivityModule {}
