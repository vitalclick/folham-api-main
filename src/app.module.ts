import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AdAccountModule } from './ad-accounts/ad-accounts.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FeedbackModule } from './feedback/feedback.module';
import { UsersModule } from './users/users.module';
import { WidgetsModule } from './widgets/widgets.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { AdScreenModule } from './ad-screens/ad-screens.module';
import { CampaignModule } from './campaign/campaign.module';
import { AdsModule } from './ads/ads.module';
import { PublicAdvertsModule } from './public-adverts/public-adverts.module';
import { DeviceLogsModule } from './device-logs/device-logs.module';
import { CampaignActivityModule } from './campaign-activity/campaign-activity.module';
import { ScheduleJobsModule } from './schedule-jobs/schedule-jobs.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AdscreenCityModule } from './ad-screen-city/ad-screen-city.module';
import { QueuesModule } from './queues/queues.module';
import { OrganizationModule } from './organization/organization.module';
import { ScrollingAdsModule } from './scrolling-ads/scrolling-ads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DATABASE_URL, {}),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.get('THROTTLE_TTL'),
        limit: config.get('THROTTLE_LIMIT'),
      }),
    }),

    QueuesModule,
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    FeedbackModule,
    AdAccountModule,
    WidgetsModule,
    ActivityLogModule,
    AdScreenModule,
    CampaignModule,
    AdsModule,
    PublicAdvertsModule,
    DeviceLogsModule,
    CampaignActivityModule,
    ScheduleJobsModule,
    AdscreenCityModule,
    OrganizationModule,
    ScrollingAdsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
