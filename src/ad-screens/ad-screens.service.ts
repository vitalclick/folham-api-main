import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdScreensRepository } from './ad-screens.repository';
import { CreateAdScreenDto } from './dto/create-ad-screen.dto';
import { UpdateAdScreenDto } from './dto/update-ad-screen.dto';
import { AdScreen } from './schema/ad-screen.schema';
import { Types } from 'mongoose';
import { CampaignService } from '../campaign/campaign.service';
import { ActionType } from '../activity-log/types/action-type.types';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { PagingOptions } from '../activity-log/types/paging-options.types';
import { LayoutType, Status } from './types/ad-screen.types';
import { ScreenDetails } from './types/screenDetails.interface';
import { AdAccountsService } from '../ad-accounts/ad-accounts.service';
import { AdsService } from '../ads/ads.service';
import { UserAuthInfo } from '../users/interface/user.interface';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class AdScreensService {
  constructor(
    private adScreensRepository: AdScreensRepository,
    @Inject(forwardRef(() => CampaignService))
    private campaignService: CampaignService,
    private activityLogService: ActivityLogService,
    @Inject(forwardRef(() => AdAccountsService))
    private adAccountService: AdAccountsService,
    @Inject(forwardRef(() => AdsService))
    private adService: AdsService,
  ) {}

  async create(
    adScreen: CreateAdScreenDto,
    user: UserAuthInfo,
  ): Promise<AdScreen> {
    const userId = user._id;
    try {
      const [exist, existDevice] = await Promise.all([
        this.adScreensRepository.findOne({
          name: adScreen.name,
        }),
        this.adScreensRepository.findOne({
          deviceId: adScreen.deviceId,
        }),
      ]);
      if (exist) {
        throw new Error('The Ad Screen specified already exist');
      }
      if (existDevice) {
        throw new Error('The Screen Device specified already exist');
      }
      const organizationId = adScreen.organizationId
        ? adScreen.organizationId
        : user?.organizationId
        ? user.organizationId
        : null;

      // setting screen view port and flex layout
      const screenFlexLayout = this.parseScreenLayoutToFlex(adScreen.layout);
      const adScreenData = {
        screenId: adScreen.screenId,
        name: adScreen.name,
        layout: adScreen.layout,
        height: adScreen.height,
        width: adScreen.width,
        deviceId: adScreen.deviceId,
        status: Status.offline,
        city: adScreen.city,
        organizationId: organizationId,
        flexLayout: screenFlexLayout,
        scrollingAds: adScreen.scrollingAds,
      };
      if (adScreenData.height < 1 || adScreenData.width < 1) {
        throw new NotFoundException(
          'The Screen height or width should not be less than 1',
        );
      }
      const createdAdScreen = await this.adScreensRepository.create(
        adScreenData,
      );
      if (createdAdScreen) {
        const log = {
          userId: userId,
          message: ActionType.create_new_screen + ' ' + adScreen.name,
        };
        await this.activityLogService.saveActivityLog(log);
      }
      return createdAdScreen;
    } catch (error) {
      console.log(error);
      throw new Error(
        'Error creating the ad screen, please try again or contact support',
      );
    }
  }

  parseScreenLayoutToFlex(layout) {
    if (
      layout == LayoutType.landscape_full ||
      layout == LayoutType.portrait_full
    ) {
      return [
        {
          order: 1,
          flex: 6,
        },
      ];
    }
    if (
      layout == LayoutType.landscape_80_20 ||
      layout == LayoutType.portrait_80_20
    ) {
      return [
        {
          order: 1,
          flex: 4,
        },
        {
          order: 2,
          flex: 2,
        },
      ];
    }
    if (
      layout == LayoutType.landscape_20_80 ||
      layout == LayoutType.portrait_20_80
    ) {
      return [
        {
          order: 1,
          flex: 2,
        },
        {
          order: 2,
          flex: 4,
        },
      ];
    }
    if (
      layout == LayoutType.landscape_split ||
      layout == LayoutType.portrait_split
    ) {
      return [
        {
          order: 1,
          flex: 3,
        },
        {
          order: 2,
          flex: 3,
        },
      ];
    }
    return [
      {
        order: 1,
        flex: 6,
      },
    ];
  }

  async findDeviceById(id: string) {
    try {
      const adScreen = await this.adScreensRepository.findOne({
        _id: id,
      });
      return adScreen;
    } catch (error) {
      throw new NotFoundException('The adScreen specified does not exist');
    }
  }

  async findOneById(id: string, user: UserAuthInfo) {
    const loggedUser = new User(user as unknown as User);
    try {
      const [adScreen, adScreenCampaigns] = await Promise.all([
        this.adScreensRepository.findOneById(new Types.ObjectId(id)),
        this.campaignService.getScreenAdAccounts(id),
        ,
      ]);
      const screenDetails = {
        adScreenDetails: adScreen,
        adScreenCampaignsAndAdverts: adScreenCampaigns,
      };
      if (
        loggedUser.isOrganizationOwner(adScreen?.organizationId) &&
        !loggedUser.isAdmin() &&
        !loggedUser.isSuperAdmin()
      ) {
        throw new NotFoundException(
          'You are not authorized to perform this operation, this screen does not belong to your organization',
        );
      }
      return screenDetails;
    } catch (error) {
      console.log(error);
      throw new Error(
        'Error getting the ad screen, please try again or contact support',
      );
    }
  }

  async findOneByIdForDevice(id: string) {
    try {
      const [adScreen, adScreenCampaigns] = await Promise.all([
        this.adScreensRepository.findOneById(new Types.ObjectId(id)),
        this.campaignService.getScreenAdAccounts(id),
        ,
      ]);
      const screenDetails = {
        adScreenDetails: adScreen,
        adScreenCampaignsAndAdverts: adScreenCampaigns,
      };

      return screenDetails;
    } catch (error) {
      throw new NotFoundException('The adScreen specified does not exist');
    }
  }

  async findAllScreens(
    user: UserAuthInfo,
    pagination: PagingOptions,
  ): Promise<AdScreen[]> {
    return this.adScreensRepository.findWithPagination(user, pagination);
  }

  async findDistinctCities(): Promise<string[]> {
    return this.adScreensRepository.findDistinctCities();
  }

  async update(id: string, data: UpdateAdScreenDto, user: UserAuthInfo) {
    const userId = user._id;
    const loggedUser = new User(user as unknown as User);
    const existingAdScreen = await this.adScreensRepository.findOne({
      _id: new Types.ObjectId(id),
    });
    if (!existingAdScreen) {
      console.log('here');
      throw new NotFoundException('The Ad Screen specified does not exist');
    }
    if (
      !loggedUser.isAdmin() &&
      !loggedUser.isOrganizationOwner(existingAdScreen?.organizationId) &&
      !loggedUser.isSuperAdmin()
    ) {
      console.log('here');
      throw new NotFoundException(
        'You are not authorized to perform this operation, this screen does not belong to your organization',
      );
    }
    if (!data.layout) {
      data.layout = existingAdScreen.layout;
    }
    const screenFlexLayout = this.parseScreenLayoutToFlex(data.layout);
    data['flexLayout'] = screenFlexLayout;
    const updatedAdScreen = this.adScreensRepository.updateOne(id, data);

    if (updatedAdScreen) {
      const log = {
        userId: userId,
        message: ActionType.update_screen + ' ' + data.name,
      };
      await this.activityLogService.saveActivityLog(log);
    }
    return updatedAdScreen;
  }

  async delete(id: string, user: UserAuthInfo): Promise<any> {
    const userId = user._id;
    const loggedUser = new User(user as unknown as User);
    const adScreen = await this.adScreensRepository.findOne({
      _id: new Types.ObjectId(id),
    });

    if (!adScreen) {
      throw new NotFoundException('The adScreen specified does not exist');
    }
    if (
      !loggedUser.isAdmin() &&
      !loggedUser.isOrganizationOwner(adScreen.organizationId) &&
      !loggedUser.isSuperAdmin()
    ) {
      throw new NotFoundException(
        'You are not authorized to perform this operation, this screen does not belong to your organization',
      );
    }
    try {
      const deletedAdScreen = await this.adScreensRepository.delete({
        _id: adScreen._id,
      });
      if (deletedAdScreen) {
        const log = {
          userId: userId,
          message: ActionType.delete_screen + ' ' + adScreen.name,
        };
        await this.activityLogService.saveActivityLog(log);
      }

      const adScreenAccount =
        await this.adAccountService.returnAllAdAccountsRelatedToAdScreen(id);

      if (adScreenAccount) {
        adScreenAccount.forEach(async (adAccountScreenId) => {
          if (adAccountScreenId.adScreen == id) {
            const [campaigns, ads, accounts] = await Promise.all([
              this.campaignService.deleteManyCampaignsByAdScreen(adScreen._id),
              this.adService.removeMultipleAds(adAccountScreenId.adAccount),
              this.adAccountService.removeManyAdAccounts(adScreen._id),
            ]);
          }
        });
      }
      return deletedAdScreen;
    } catch (err) {
      console.log(err);
      throw new Error(
        'Error deleteing the ad screen, please try again or contact support',
      );
    }
  }

  async countScreens(): Promise<number> {
    try {
      return this.adScreensRepository.count({});
    } catch (error) {
      throw error;
    }
  }

  async getAllUniqueScreenIds(
    user?: UserAuthInfo,
    isSuperAdmin = false,
  ): Promise<ScreenDetails[]> {
    try {
      const screenIds = [];
      const screens = await this.adScreensRepository.findAll(
        user,
        isSuperAdmin,
      );
      screens.map((screen) => {
        const screenDetails = {
          id: screen._id,
          screenId: screen.screenId,
          deviceId: screen.deviceId,
          name: screen.name,
          sendEmailNotification: screen.sendEmailNotification,
        };
        screenIds.push(screenDetails);
      });
      return screenIds;
    } catch (error) {
      console.log(error);
      throw new Error(
        'Error getting the ad screen, please try again or contact support',
      );
    }
  }
  async toggleEmailNotification(id: string, status: boolean) {
    const adScreen = await this.adScreensRepository.findOne({
      _id: new Types.ObjectId(id),
    });
    if (!adScreen) {
      throw new NotFoundException('The Ad Screen specified does not exist');
    }
    try {
      const updatedAdScreen = await this.adScreensRepository.updateOne(id, {
        sendEmailNotification: status,
      });
      return updatedAdScreen;
    } catch (error) {
      console.log(error);
      throw new Error(
        'Error updating the ad screen, please try again or contact support',
      );
    }
  }
}
