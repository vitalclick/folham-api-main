import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ScrollingAds,
  ScrollingAdsSchema,
} from './schema/scrolling-ads.schema';
import { ScrollingAdsService } from './scrolling-ads.service';
import { ScrollingAdsRepository } from './scrolling-ads.repository';
import { ScrollingAdsController } from './scrolling-ads.controller';
import { QueuesModule } from '../queues/queues.module';
import { AdScreenModule } from '../ad-screens/ad-screens.module';
import { ContentDetailsRepository } from './content-details.repository';
import {
  ContentDetails,
  ContentDetailsSchema,
} from './schema/content-details.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ScrollingAds.name,
        schema: ScrollingAdsSchema,
      },
      {
        name: ContentDetails.name,
        schema: ContentDetailsSchema,
      },
    ]),
    QueuesModule,
    forwardRef(() => AdScreenModule),
  ],
  controllers: [ScrollingAdsController],
  providers: [
    ScrollingAdsRepository,
    ScrollingAdsService,
    ContentDetailsRepository,
  ],
  exports: [ScrollingAdsService],
})
export class ScrollingAdsModule {}
