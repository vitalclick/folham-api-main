import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { ActionType } from '../activity-log/types/action-type.types';
import { Types } from 'mongoose';
import { AdsRepository } from './ads.repository';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { Ads, AdsDocument } from './schema/ad.schema';
import { AdAccountsService } from '../ad-accounts/ad-accounts.service';
import { CampaignService } from '../campaign/campaign.service';
import { UserAuthInfo } from '../users/interface/user.interface';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class AdsService {
  constructor(
    private adsRepository: AdsRepository,
    private activityLogService: ActivityLogService,
    @Inject(forwardRef(() => AdAccountsService))
    private adAccountService: AdAccountsService,
    private campaignService: CampaignService,
  ) {}

  async create(ad: CreateAdDto, user): Promise<Ads[]> {
    const userId = user._id;
    const allAdData = [];
    for (const adfile of ad.adFile) {
      allAdData.push({
        adAccount: new Types.ObjectId(ad.adAccount),
        adFile: [adfile],
        organizationId: ad?.organizationId
          ? ad.organizationId
          : user.organizationId,
      });
    }
    try {
      const existingAccount = await this.adAccountService.findOneById(
        ad.adAccount,
        user,
      );
      if (!existingAccount) {
        throw new NotFoundException(
          'The Ad Screen or Ad Account specified is in use already, try another',
        );
      }
      for (const adFileData of allAdData) {
        await this.adsRepository.create(adFileData);
      }
      const log = {
        userId: userId,
        message: ActionType.create_new_ad,
      };
      await this.activityLogService.saveActivityLog(log);

      return this.retrieveAdsByAdAccount(ad.adAccount);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findOneById(id: string, user: UserAuthInfo): Promise<AdsDocument> {
    const loggedUser = new User(user as unknown as User);
    const ad = await this.adsRepository.findOneById({
      _id: new Types.ObjectId(id),
    });
    if (
      !loggedUser.isAdmin() &&
      !loggedUser.isOrganizationOwner(ad?.organizationId) &&
      !loggedUser.isSuperAdmin()
    ) {
      throw new Error(
        'You are not authorized to perform this action, this ad belongs to another organization',
      );
    }
    return ad;
  }

  async findAll(user): Promise<Ads[]> {
    return this.adsRepository.find(user);
  }

  async update(id: string, data: UpdateAdDto, user: UserAuthInfo) {
    const loggedUser = new User(user as unknown as User);

    const existingAds = await this.adsRepository.findOne({
      id: id,
    });
    if (!existingAds) {
      throw new NotFoundException('The Ads specified does not exist');
    }
    if (
      !loggedUser.isAdmin() &&
      !loggedUser.isOrganizationOwner(existingAds?.organizationId) &&
      !loggedUser.isSuperAdmin()
    ) {
      throw new Error(
        'You are not authorized to perform this action, this ad belongs to another organization',
      );
    }
    try {
      const updatedAds = this.adsRepository.updateOne(id, data);
      if (updatedAds) {
        const log = {
          userId: user._id,
          message: ActionType.update_ad,
        };
        await this.activityLogService.saveActivityLog(log);
      }
      return updatedAds;
    } catch (error) {
      throw new NotFoundException('The ad specified does not exist');
    }
  }

  async delete(id: string, user: UserAuthInfo): Promise<any> {
    const loggedUser = new User(user as unknown as User);

    const ad = await this.adsRepository.findOneById({
      _id: new Types.ObjectId(id),
    });
    if (!ad) {
      throw new NotFoundException('The ad specified does not exist');
    }
    const campaignsUsingAd = await this.adsRepository.getCampaignsUsingAds(
      id,
      ad.adAccount.toHexString(),
    );
    if (
      !loggedUser.isAdmin() &&
      !loggedUser.isOrganizationOwner(ad?.organizationId) &&
      !loggedUser.isSuperAdmin()
    ) {
      throw new Error(
        'You are not authorized to perform this action, this ad belongs to another organization',
      );
    }
    try {
      for (const campaignUsingAd of campaignsUsingAd) {
        for (const campaign of campaignUsingAd.campaigns) {
          const updatedAdFiles: string[] = [];
          let adFileIndex = 0;

          for (const adFile of campaign.adFiles) {
            if (adFile.toHexString() !== id) {
              updatedAdFiles.push(adFile.toHexString());
            } else {
              campaign.adFiles.splice(adFileIndex, 1);
            }
            adFileIndex++;
          }

          await this.campaignService.update(
            campaign._id.toHexString(),
            { adFiles: updatedAdFiles as [string] },
            user,
          );
        }
      }

      const deleteAd = await this.adsRepository.delete({
        _id: new Types.ObjectId(id),
      });

      if (deleteAd) {
        return {
          message: 'Ad image deleted successfully',
          code: '00',
        };
      }

      return {
        error: 'Unable to delete Ad image',
        code: '99',
      };
    } catch (error) {
      console.log(error);
      return {
        error: 'Unable to delete Ad image',
        code: '99',
      };
    }
  }

  async retrieveAdsByAdAccount(adAccount: string): Promise<Ads[]> {
    try {
      return this.adsRepository.getAdImages(adAccount);
    } catch (error) {
      throw new NotFoundException('The ad specified does not exist');
    }
  }

  // async getCampaignAdAccounts(adScreen) {
  //   try {
  //     const adScreenId = new Types.ObjectId(adScreen);
  //     return this.adsRepository.groupCampaignScheduleByAdScreen(adScreenId);
  //   } catch (error) {
  //     throw new NotFoundException('The ad specified does not exist');
  //   }
  // }

  async removeMultipleAds(adAccount: string) {
    try {
      return this.adsRepository.deleteMany(adAccount);
    } catch (error) {
      throw new NotFoundException('The ad specified does not exist');
    }
  }
}
