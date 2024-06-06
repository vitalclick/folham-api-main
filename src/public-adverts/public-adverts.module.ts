import { forwardRef, Module } from '@nestjs/common';
import { AdScreenModule } from '../ad-screens/ad-screens.module';
import { PublicAdvertsService } from './public-adverts.service';
import { PublicAdvertsController } from './public-adverts.controller';
import { AdsModule } from '../ads/ads.module';
import { CampaignModule } from '../campaign/campaign.module';
import { WidgetsModule } from '../widgets/widgets.module';
import { ConfigModule } from '@nestjs/config';
import { AdAccountModule } from '../ad-accounts/ad-accounts.module';

@Module({
  imports: [
    AdScreenModule,
    AdsModule,
    forwardRef(() => CampaignModule),
    forwardRef(() => WidgetsModule),
    ConfigModule,
    forwardRef(() => AdAccountModule),
  ],
  controllers: [PublicAdvertsController],
  providers: [PublicAdvertsService],
  exports: [PublicAdvertsService],
})
export class PublicAdvertsModule {}
