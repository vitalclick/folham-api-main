import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdAccountsService } from '../ad-accounts/ad-accounts.service';
import { AdType } from '../ads/types/ads.type';
import { Widgets } from '../widgets/schema/widgets.schema';
import { WidgetsService } from '../widgets/widgets.service';
import { AdScreensRepository } from '../ad-screens/ad-screens.repository';
import { AdsRepository } from '../ads/ads.repository';
import { CampaignRepository } from '../campaign/campaign.repository';
import { slugAString } from '../common/utils/transformHTML';
import { AdScreenDocument } from '../ad-screens/schema/ad-screen.schema';

@Injectable()
export class PublicAdvertsService {
  constructor(
    private screenRepository: AdScreensRepository,
    @Inject(forwardRef(() => CampaignRepository))
    private campaignRepository: CampaignRepository,
    private adRepository: AdsRepository,
    @Inject(forwardRef(() => WidgetsService))
    private widgetService: WidgetsService,
    private configService: ConfigService,
    @Inject(forwardRef(() => AdAccountsService))
    private adAccountsService: AdAccountsService,
  ) {}

  async displayAdAndConfigurationSplitScreen(deviceId: string) {
    const adScreen = await this.screenRepository.getScreenId({
      deviceId: deviceId,
    });

    if (!adScreen) {
      throw new NotFoundException('No ad screen found for this device');
    }
    const widgets = await this.widgetService.getScreenWidget(adScreen._id);
    const deviceConfig = {
      screenId: adScreen._id,
      deviceId: adScreen.deviceId,
      ttl: '2026-12-30T23:59:59',
      screenResolution: '1280_720',
      layout: this.returnPotraitOrLandscape(adScreen),
      city: adScreen.city || 'Lagos',
    };
    const adAccountOrder =
      await this.adAccountsService.findAdaccountScheduleByScreenForDevice(
        adScreen._id,
      );

    const campaignAdvertArray: IPublicAdvertCampaign[][] = [];
    for (const account of adAccountOrder) {
      const accountCampaigns = [];
      const campaignConfigs =
        await this.campaignRepository.getAdsAccountConfiguration(account._id);
      if (campaignConfigs) {
        for (const campaignConfig of campaignConfigs) {
          // console.log(campaignConfig);
          if (campaignConfig && campaignConfig.adFile) {
            const adid = campaignConfig.adFile.adUrl.split('/');
            let image = true;
            let video = false;
            let adType = 'picture';
            if (adid[adid.length - 1].split('.')[1] == 'mp4') {
              image = false;
              video = true;
              adType = 'video';
            }

            if (
              campaignConfig.adFile.adType == AdType.html &&
              campaignConfig.adFile.adUrl.includes('youtube.com/embed/')
            ) {
              adType = 'youtube';
            }

            if (!video && !image && adType != 'youtube') {
              adType = 'iframe';
            }

            const publicCampaignAdvert = {
              campaignId: campaignConfig._id,
              adAccountId: campaignConfig.adAccount.toHexString(),
              adId: slugAString(adid[adid.length - 1].split('.')[0]),
              adUrl: campaignConfig.adFile.adUrl,
              adType: adType,
              screenViewPort: campaignConfig.screenViewPort,
              adConfiguration: {
                duration: image
                  ? campaignConfig.videoAndImageDuration
                  : campaignConfig.videoAndImageDuration,
                startTime: '2022-06-25T' + campaignConfig.startTime + ':00',
                endTime: '2022-06-25T' + campaignConfig.endTime + ':00',
                days: campaignConfig.campaignScheduleDays,
              },
            };
            accountCampaigns.push(publicCampaignAdvert);
          }
        }
        campaignAdvertArray.push(accountCampaigns);
      }
    }
    // console.log('campaignAdvertArray', campaignAdvertArray);
    const sortedPublicAdverts = await this.combineCampaigns(
      campaignAdvertArray,
    );
    // console.log('sortedPublicAdverts', sortedPublicAdverts);
    const flexSortedCampaigns = await this.processScreenFlex(
      adScreen,
      sortedPublicAdverts,
      widgets,
    );
    return { config: deviceConfig, data: flexSortedCampaigns };
  }

  async processScreenFlex(
    adScreen: AdScreenDocument,
    sortedPublicAdverts: IPublicAdvertCampaign[],
    widgets: Widgets[],
  ) {
    // sort the campaigns by screenViewPort

    let screenWidgets = [];
    if (widgets) {
      screenWidgets = this.addWidgetsToCampaigns(widgets, adScreen.city);
    }
    const flexCampaigns = [];
    const flexLayout =
      adScreen?.flexLayout.length > 0
        ? adScreen?.flexLayout
        : [{ flex: 6, order: 1 }];
    flexLayout.map((layout) => {
      const campaigns = [];
      const screenViewPort = layout.order;
      sortedPublicAdverts.map((campaign) => {
        if (campaign['screenViewPort'] == screenViewPort) {
          delete campaign['screenViewPort'];
          campaigns.push(campaign);
        }
      });
      const layoutCampaign = {
        flex: layout.flex,
        campaigns: [...campaigns, ...screenWidgets],
      };
      flexCampaigns.push(layoutCampaign);
    });
    return flexCampaigns;
  }

  returnPotraitOrLandscape(adScreen: AdScreenDocument) {
    if (adScreen.layout.includes('Landscape')) {
      return 'Landscape';
    }
    return 'Portrait';
  }

  async displayAdAndConfiguration(deviceId: string) {
    const adScreen = await this.screenRepository.getScreenId({
      deviceId: deviceId,
    });

    if (!adScreen) {
      throw new NotFoundException('No ad screen found for this device');
    }
    const widgets = await this.widgetService.getScreenWidget(adScreen._id);
    const deviceConfig = {
      screenId: adScreen._id,
      deviceId: adScreen.deviceId,
      ttl: '2026-12-30T23:59:59',
      screenResolution: '1280_720',
      layout: 'Landscape-Full',
    };
    const adAccountOrder =
      await this.adAccountsService.findAdaccountScheduleByScreenForDevice(
        adScreen._id,
      );

    const campaignAdvertArray: IPublicAdvertCampaign[][] = [];
    for (const account of adAccountOrder) {
      const accountCampaigns = [];
      const campaignConfigs =
        await this.campaignRepository.getAdsAccountConfiguration(account._id);
      if (campaignConfigs) {
        for (const campaignConfig of campaignConfigs) {
          if (campaignConfig && campaignConfig.adFile) {
            const adid = campaignConfig.adFile.adUrl.split('/');
            let image = true;
            let video = false;
            let adType = 'picture';
            if (adid[adid.length - 1].split('.')[1] == 'mp4') {
              image = false;
              video = true;
              adType = 'video';
            }

            if (
              campaignConfig.adFile.adType == AdType.html &&
              campaignConfig.adFile.adUrl.includes('youtube.com/embed/')
            ) {
              adType = 'youtube';
            }

            if (!video && !image && adType != 'youtube') {
              adType = 'iframe';
            }

            const publicCampaignAdvert = {
              campaignId: campaignConfig._id,
              adAccountId: campaignConfig.adAccount.toHexString(),
              adId: slugAString(adid[adid.length - 1].split('.')[0]),
              adUrl: campaignConfig.adFile.adUrl,
              adType: adType,
              adConfiguration: {
                duration: image
                  ? campaignConfig.videoAndImageDuration
                  : campaignConfig.videoAndImageDuration,
                startTime: '2022-06-25T' + campaignConfig.startTime + ':00',
                endTime: '2022-06-25T' + campaignConfig.endTime + ':00',
                days: campaignConfig.campaignScheduleDays,
              },
            };
            accountCampaigns.push(publicCampaignAdvert);
          }
        }
        campaignAdvertArray.push(accountCampaigns);
      }
    }
    let sortedPublicAdverts = await this.combineCampaigns(campaignAdvertArray);
    if (widgets) {
      const screenWidgets = this.addWidgetsToCampaigns(widgets, adScreen.city);
      sortedPublicAdverts = [...sortedPublicAdverts, ...screenWidgets];
    }
    return { config: deviceConfig, data: sortedPublicAdverts };
  }

  addWidgetsToCampaigns(
    widgets: Widgets[],
    city: string,
  ): IPublicAdvertCampaign[] {
    const widgetArray: IPublicAdvertCampaign[] = [];
    for (const widget of widgets) {
      let widgetUrl = `${this.configService.get<string>('CLOCK_WIDGET_URL')}`;
      if (widget.widgetType == 'weather') {
        widgetUrl = `${this.configService.get<string>(
          'WEATHER_WIDGET_URL',
        )}${city}`;
      }
      const campaignData = {
        campaignId: widget.screenId.toHexString(),
        adAccountId: widget.screenId.toHexString(),
        adId: widget.widgetType,
        adUrl: widgetUrl,
        adType: 'iframe',
        adConfiguration: {
          duration: 10,
          startTime: '2022-06-25T00:00',
          endTime: '2022-06-25T23:59',
          days: [
            'Sunday',
            'Saturday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
          ],
        },
      };
      widgetArray.push(campaignData);
    }
    return widgetArray;
  }

  async combineCampaigns(campaignAdvertArray: IPublicAdvertCampaign[][]) {
    const combinedArray: IPublicAdvertCampaign[] = [];
    let maxlength = 0;
    let journey = 0;
    for (const eachArr of campaignAdvertArray) {
      if (eachArr.length > maxlength) {
        maxlength = eachArr.length;
      }
    }
    while (journey < maxlength) {
      for (const element of campaignAdvertArray) {
        if (element.length > 0) {
          combinedArray.push(element[0]);
          element.push(element.shift());
        }
      }
      journey++;
    }
    return combinedArray;
  }
}
