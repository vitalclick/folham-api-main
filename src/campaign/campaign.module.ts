import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Campaign, CampaignSchema } from './schema/campaign.schema';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { CampaignRepository } from './campaign.repository';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { AdAccountModule } from '../ad-accounts/ad-accounts.module';
import { CampaignActivityModule } from '../campaign-activity/campaign-activity.module';
import { UsersModule } from '../users/users.module';
import { PublicAdvertsModule } from '../public-adverts/public-adverts.module';
import { AdScreenModule } from '../ad-screens/ad-screens.module';
import { CommonModule } from '../common/common.module';
import { QueuesModule } from '../queues/queues.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Campaign.name,
        schema: CampaignSchema,
      },
    ]),
    ActivityLogModule,
    forwardRef(() => AdAccountModule),
    CampaignActivityModule,
    UsersModule,
    PublicAdvertsModule,
    forwardRef(() => AdScreenModule),
    CommonModule,
    QueuesModule,
  ],
  controllers: [CampaignController],
  providers: [CampaignService, CampaignRepository],
  exports: [CampaignService, CampaignRepository],
})
export class CampaignModule {}
