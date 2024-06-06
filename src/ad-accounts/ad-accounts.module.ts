import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdAccountController } from './ad-accounts.controller';
import { AdAccount, AdAccountSchema } from './schema/ad-account.schema';
import { AdAccountRepository } from './ad-accounts.repository';
import { AdAccountsService } from './ad-accounts.service';
import { AdCompanyRepository } from './ad-company.repository';
import { AdCompany, AdCompanySchema } from './schema/ad-company.schema';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { CampaignModule } from '../campaign/campaign.module';
import { AdScreenModule } from '../ad-screens/ad-screens.module';
import { UsersModule } from '../users/users.module';
import { PublicAdvertsModule } from '../public-adverts/public-adverts.module';
import { QueuesModule } from '../queues/queues.module';
import { AdsModule } from '../ads/ads.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AdAccount.name,
        schema: AdAccountSchema,
      },
      {
        name: AdCompany.name,
        schema: AdCompanySchema,
      },
    ]),
    ActivityLogModule,
    forwardRef(() => CampaignModule),
    forwardRef(() => UsersModule),
    forwardRef(() => AdScreenModule),
    PublicAdvertsModule,
    QueuesModule,
    AdsModule,
  ],
  controllers: [AdAccountController],
  providers: [AdAccountsService, AdAccountRepository, AdCompanyRepository],
  exports: [AdAccountsService],
})
export class AdAccountModule {}
