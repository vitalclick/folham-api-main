import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { Ads, AdsSchema } from './schema/ad.schema';
import { AdsController } from './ads.controller';
import { AdsService } from './ads.service';
import { AdsRepository } from './ads.repository';
import { AdAccountModule } from '../ad-accounts/ad-accounts.module';
import { CampaignModule } from '../campaign/campaign.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Ads.name,
        schema: AdsSchema,
      },
    ]),
    ActivityLogModule,
    forwardRef(() => AdAccountModule),
    forwardRef(() => CampaignModule),
  ],
  controllers: [AdsController],
  providers: [AdsService, AdsRepository],
  exports: [AdsService, AdsRepository],
})
export class AdsModule {}
