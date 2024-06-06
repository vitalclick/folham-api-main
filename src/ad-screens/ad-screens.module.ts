import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdScreen, AdScreenSchema } from './schema/ad-screen.schema';
import { AdScreensController } from './ad-screens.controller';
import { AdScreensRepository } from './ad-screens.repository';
import { AdScreensService } from './ad-screens.service';
import { AdAccountModule } from '../ad-accounts/ad-accounts.module';
import { AdsModule } from '../ads/ads.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { CampaignModule } from '../campaign/campaign.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AdScreen.name,
        schema: AdScreenSchema,
      },
    ]),
    forwardRef(() => CampaignModule),
    forwardRef(() => ActivityLogModule),
    forwardRef(() => AdAccountModule),
    forwardRef(() => AdsModule),
  ],
  controllers: [AdScreensController],
  providers: [AdScreensService, AdScreensRepository],
  exports: [AdScreensService, AdScreensRepository],
})
export class AdScreenModule {}
