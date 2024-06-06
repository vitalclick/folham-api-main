import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FilterQuery, Types } from 'mongoose';
import { AdsService } from '../ads/ads.service';
import { PublicAdvertsService } from '../public-adverts/public-adverts.service';
import { AdvertUpdateService } from '../queues/advert-update.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { ActionType } from '../activity-log/types/action-type.types';
import { AdScreensRepository } from '../ad-screens/ad-screens.repository';
import { CampaignService } from '../campaign/campaign.service';
import { UsersService } from '../users/users.service';
import { AdAccountRepository } from './ad-accounts.repository';
import { AdCompanyRepository } from './ad-company.repository';
import { AdAccountSequenceDto } from './dto/adaccount-sequence.dto';
import { CreateAdAccountDto } from './dto/create-ad-account.dto';
import { CreateAdCompanyDto } from './dto/create-ad-company.dto';
import { UpdateAdAccountDto } from './dto/update-ad-account.dto';
import { UpdateAdCompanyDto } from './dto/update-ad-company.dto';
import { AdAccount, AdAccountDocument } from './schema/ad-account.schema';
import { AdCompany, AdCompanyDocument } from './schema/ad-company.schema';
import {
  IAdAccountListedCampaigns,
  IAdAccountSchedule,
} from './types/adaccount.types';
import { UserAuthInfo } from '../users/interface/user.interface';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class AdAccountsService {
  constructor(
    private addAccountRepository: AdAccountRepository,
    private adCompanyRepository: AdCompanyRepository,
    private activityLogService: ActivityLogService,
    @Inject(forwardRef(() => CampaignService))
    private campaignService: CampaignService,
    private adScreenRepository: AdScreensRepository,
    private userService: UsersService,
    private publicAdvertsService: PublicAdvertsService,
    private advertUpdateService: AdvertUpdateService,
    private adService: AdsService,
  ) {}

  async findOneById(id: string, user: UserAuthInfo): Promise<AdAccount> {
    const loggedUser = new User(user as unknown as User);

    const adAccount = await this.addAccountRepository.findOneById({
      _id: new Types.ObjectId(id),
    });
    if (
      !loggedUser.isAdmin() &&
      !loggedUser.isOrganizationOwner(adAccount.organizationId) &&
      !loggedUser.isSuperAdmin()
    ) {
      throw new BadRequestException(
        'You are not allowed to view this ad account, this ad account belongs to another organization',
      );
    }
    if (!adAccount) {
      throw new NotFoundException('The adAccount specified does not exist');
    }
    return adAccount;
  }

  async findAll(user: UserAuthInfo): Promise<AdAccount[]> {
    const loggedUser = new User(user as unknown as User);
    if (loggedUser.isSuperAdmin()) {
      return this.addAccountRepository.find();
    } else {
      const findQuery: FilterQuery<AdAccountDocument> = {
        organizationId: user.organizationId,
      };
      return this.addAccountRepository.find(findQuery);
    }
  }

  async findCampaignByAdAccounts(id: string, user: UserAuthInfo) {
    const listedCampaigns: IAdAccountListedCampaigns[] = [];
    const loggedUser = new User(user as unknown as User);
    const adAccount = await this.addAccountRepository.getCampaignsByAdAccount(
      id,
    );
    if (!adAccount) {
      throw new NotFoundException('The adAccount specified does not exist');
    }
    if (
      !loggedUser.isOrganizationOwner(adAccount.organizationId) &&
      !loggedUser.isAdmin() &&
      !loggedUser.isSuperAdmin()
    ) {
      throw new Error(
        'You are not allowed to view this ad account, this ad account belongs to another organization',
      );
    }

    try {
      for (const campaign of adAccount.campaigns) {
        if (campaign.adFiles.length == 0) {
          const listedAdvert: IAdAccountListedCampaigns = {
            advertId: null,
            campaignName: campaign.name,
            campaignId: campaign._id,
            advertName: null,
            advertType: null,
            advertUrl: null,
          };
          listedCampaigns.push(listedAdvert);
        }
        for (const adverts of campaign.adFiles) {
          const advertDetails = await this.adService.findOneById(
            adverts.toHexString(),
            user,
          );
          if (advertDetails) {
            advertDetails.adFile.map((ads) => {
              if (advertDetails._id) {
                const listedAdvert: IAdAccountListedCampaigns = {
                  advertId: advertDetails._id,
                  campaignName: campaign.name,
                  campaignId: campaign._id,
                  advertName: ads.adName,
                  advertType: ads.adType,
                  advertUrl: ads.adUrl,
                };
                listedCampaigns.push(listedAdvert);
              }
            });
          }
        }
      }
      //TODO: investigate why listedCampaigns is returning null for some adverts .. and we need to clean them up

      // remove campaigns with null advertId
      const filteredCampaigns = listedCampaigns.filter(
        (campaign) => campaign.advertId != null,
      );
      return filteredCampaigns;
    } catch (err) {
      console.log(err);
      throw new Error(
        'Error while retrieving ad account campaigns. please try again or contact support',
      );
    }
  }

  async create(
    payload: CreateAdAccountDto,
    user: UserAuthInfo,
  ): Promise<AdAccount> {
    const loggedUser = new User(user as unknown as User);

    const createAdAccount = new AdAccount();
    const userId = user._id;
    const [exist, adCompany, adScreen] = await Promise.all([
      this.addAccountRepository.findOne({
        name: payload.name,
      }),
      this.adCompanyRepository.findOneById({
        _id: new Types.ObjectId(payload.adCompany),
      }),
      this.adScreenRepository.findOneById({
        _id: new Types.ObjectId(payload.adScreen),
      }),
    ]);

    if (exist) {
      throw new NotFoundException('The Ad Account specified already exist');
    }
    if (!adCompany) {
      throw new NotFoundException('The Ad Company specified does not exist');
    }
    if (!adScreen) {
      throw new NotFoundException('The Ad Screen specified does not exist');
    }
    try {
      Object.assign(createAdAccount, payload);
      createAdAccount.name = payload.name;
      createAdAccount.adCompany = new Types.ObjectId(payload.adCompany);
      createAdAccount.adScreen = new Types.ObjectId(payload.adScreen);
      createAdAccount.organizationId = payload?.organizationId
        ? new Types.ObjectId(payload.organizationId)
        : new Types.ObjectId(user?.organizationId) || adCompany?.organizationId;
      createAdAccount.adAccountName =
        adCompany.companyName + '-' + payload.name + ' | ' + adScreen.name;
      const createdAdAccount =
        this.addAccountRepository.create(createAdAccount);
      if (createdAdAccount) {
        const log = {
          userId: userId,
          message: ActionType.created_ad_account + ' ' + createAdAccount.name,
        };
        await this.activityLogService.saveActivityLog(log);
      }
      return createdAdAccount;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, data: UpdateAdAccountDto, user) {
    const userId = user._id;
    const loggedUser = new User(user as unknown as User);

    const existinadAccount = await this.addAccountRepository.findOneById(
      new Types.ObjectId(id),
    );
    if (!existinadAccount) {
      throw new NotFoundException('The adAccount specified does not exist');
    }
    if (
      !loggedUser.isOrganizationOwner(existinadAccount.organizationId) &&
      !loggedUser.isAdmin() &&
      !loggedUser.isSuperAdmin()
    ) {
      throw new BadRequestException(
        'You are not allowed to edit this ad account, this ad account belongs to another organization',
      );
    }
    try {
      const updatedAdAccount = this.addAccountRepository.updateOne(id, data);
      if (updatedAdAccount) {
        const log = {
          userId: userId,
          message:
            ActionType.update_ad_account + ' ' + (await updatedAdAccount).name,
        };
        await this.activityLogService.saveActivityLog(log);
      }
      return updatedAdAccount;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async returnOnlyAdaccountsRelatedToScreen(adScreen: string) {
    return this.addAccountRepository.getOnlyAdaccountsOnScreen(adScreen);
  }

  async findAdaccountScheduleByScreen(
    screenId: string,
    user: UserAuthInfo,
  ): Promise<IAdAccountSchedule[]> {
    const loggedUser = new User(user as unknown as User);

    const adScreen = await this.adScreenRepository.findOneById(
      new Types.ObjectId(screenId),
    );
    if (!adScreen) {
      throw new NotFoundException('The adScreen specified does not exist');
    }
    if (
      !loggedUser.isOrganizationOwner(adScreen.organizationId) &&
      !loggedUser.isAdmin() &&
      !loggedUser.isSuperAdmin()
    ) {
      throw new BadRequestException(
        'You are not allowed to view this ad screen, this ad screen belongs to another organization',
      );
    }
    try {
      const adSchedule: IAdAccountSchedule[] = [];
      const adAccount =
        await this.addAccountRepository.findAdaccountScheduleByScreen({
          adScreen: new Types.ObjectId(screenId),
        });

      for (const account of adAccount) {
        adSchedule.push({
          adAccount: account,
          adScreen: adScreen._id,
          name: account.name,
          order: account.order,
          _id: account._id,
        });
      }
      return adSchedule;
    } catch (error) {
      throw new NotFoundException('The adAccount specified does not exist');
    }
  }

  async findAdaccountScheduleByScreenWithViewPort(
    screenId: string,
    user: UserAuthInfo,
  ) {
    const loggedUser = new User(user as unknown as User);

    const adScreen = await this.adScreenRepository.findOneById(
      new Types.ObjectId(screenId),
    );
    if (!adScreen) {
      throw new NotFoundException('The adScreen specified does not exist');
    }
    if (
      !loggedUser.isOrganizationOwner(adScreen.organizationId) &&
      !loggedUser.isAdmin() &&
      !loggedUser.isSuperAdmin()
    ) {
      throw new BadRequestException(
        'You are not allowed to view this ad screen, this ad screen belongs to another organization',
      );
    }
    try {
      // const adSchedule: IAdAccountSchedule[] = [];
      const adAccounts =
        await this.addAccountRepository.findAdaccountScheduleByScreenWithViewort(
          {
            adScreen: new Types.ObjectId(screenId),
          },
        );
      adAccounts.forEach((item: any) => {
        item.accounts = item.accounts.sort(
          (a: any, b: any) => a.order - b.order,
        );
      });
      return adAccounts;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('The adAccount specified does not exist');
    }
  }

  /**
   * WIP - This method is not yet complete and should be refactored
   * @param screenId
   * @returns
   */

  async findAdaccountScheduleByScreenForDevice(
    screenId: string,
  ): Promise<IAdAccountSchedule[]> {
    const adScreen = await this.adScreenRepository.findOneById(
      new Types.ObjectId(screenId),
    );
    if (!adScreen) {
      throw new NotFoundException('The adScreen specified does not exist');
    }
    try {
      const adSchedule: IAdAccountSchedule[] = [];
      const adAccount =
        await this.addAccountRepository.findAdaccountScheduleByScreen({
          adScreen: new Types.ObjectId(screenId),
        });

      for (const account of adAccount) {
        adSchedule.push({
          adAccount: account,
          adScreen: adScreen._id,
          name: account.name,
          order: account.order,
          _id: account._id,
        });
      }
      return adSchedule;
    } catch (error) {
      throw new NotFoundException('The adAccount specified does not exist');
    }
  }

  async updateScheduleSequence(sequenceDto: AdAccountSequenceDto[]) {
    const adAccountSequence = [];
    const screenId = [];

    for (const data of sequenceDto) {
      // Update the adAccount
      const adAccount = await this.addAccountRepository.updateOne(
        data.adAccountId,
        {
          order: data.order,
        },
      );

      // If adAccount is not found (null or undefined), skip to the next iteration
      if (!adAccount) {
        console.log('AdAccount not found, moving to the next item');
        continue;
      }

      adAccountSequence.push({
        _id: adAccount._id,
        adAccountName: adAccount.name,
        order: adAccount.order,
      });
      screenId.push(adAccount.adScreen);
    }

    const screen = await this.adScreenRepository.findOneById({
      _id: screenId[0],
    });

    // Ensure screen exists before continuing
    if (screen) {
      const publicAdvert =
        await this.publicAdvertsService.displayAdAndConfiguration(
          screen.deviceId,
        );
      await this.advertUpdateService.addToQueue(publicAdvert);
    } else {
      console.log('Screen not found.');
    }

    return adAccountSequence;
  }

  async delete(id: string, user): Promise<any> {
    const userId = user._id;
    try {
      const [adAccount, adInCampaign] = await Promise.all([
        this.addAccountRepository.findOneById({ _id: new Types.ObjectId(id) }),
        this.campaignService.getCampaignByAdAccount(id),
      ]);

      if (adAccount && !adInCampaign) {
        const deletedAdAccount = await this.addAccountRepository.delete({
          _id: new Types.ObjectId(adAccount._id),
        });

        if (deletedAdAccount) {
          const log = {
            userId: userId,
            message: ActionType.deleted_ad_account + ' ' + adAccount.name,
          };
          await this.activityLogService.saveActivityLog(log);
        }
        return deletedAdAccount;
      } else {
        throw new NotFoundException(
          'This ad account is still in use in a campaign, Delete campaign first before removing ad account',
        );
      }
    } catch (error) {
      throw new NotFoundException(
        'This ad account does not exist or cannot be removed, Delete campaign using adAccount first before removing ad account ',
      );
    }
  }

  async findAllAdCompany(
    user: UserAuthInfo,
    filter: boolean,
  ): Promise<AdCompany[]> {
    const loggedUser = new User(user as unknown as User);
    const findQuery: FilterQuery<AdCompanyDocument> = {};
    // If the user is not admin, restrict to their organization
    if (!loggedUser.isSuperAdmin()) {
      findQuery.organizationId = user.organizationId;
    }
    // If filter is true, add the companyActiveStatus condition
    if (filter) {
      findQuery.companyActiveStatus = 0;
    }
    return this.adCompanyRepository.find(findQuery);
  }

  async findOneAdCompanyById(id: string, user: UserAuthInfo) {
    let adAccountAndCampaigns;
    const loggedUser = new User(user as unknown as User);
    const adAccountsAndCampaigns = [];
    const [adCompany, adAccounts] = await Promise.all([
      this.adCompanyRepository.findOneById({ _id: new Types.ObjectId(id) }),
      this.addAccountRepository.findAdAccountsByAdCompany(
        new Types.ObjectId(id),
      ),
    ]);
    if (!adCompany || !adAccounts) {
      throw new NotFoundException(
        'There are no ad accounts connected to this ad company',
      );
    }
    if (
      !loggedUser.isAdmin() &&
      !loggedUser.isOrganizationOwner(adCompany.organizationId) &&
      !loggedUser.isSuperAdmin()
    ) {
      throw new BadRequestException(
        'You are not allowed to view this ad company, this ad company belongs to another organization',
      );
    }
    try {
      for (let i = 0; i < adAccounts.length; i++) {
        const adAccount = adAccounts[i];
        if (adAccount) {
          const adAccountCampaigns =
            await this.campaignService.findCampaignsByAdccount(adAccount._id);
          adAccountAndCampaigns = {
            adAccountId: adAccount._id,
            adAccount: adAccount.name,
            campaigns: adAccountCampaigns,
          };
        }
        adAccountsAndCampaigns.push(adAccountAndCampaigns);
      }
      const adCompanyAndAccounts = {
        company: adCompany.companyName,
        adAccountAndCampaigns: adAccountsAndCampaigns,
      };
      return adCompanyAndAccounts;
    } catch (error) {
      console.log(error);
      throw new NotFoundException(
        'Error while retrieving ad company and ad accounts. please try again or contact support',
      );
    }
  }

  async createAdCompany(
    adCompany: CreateAdCompanyDto,
    user: UserAuthInfo,
  ): Promise<AdCompany> {
    const userId = user._id;
    const [existCompany, existUserAccount] = await Promise.all([
      this.adCompanyRepository.findOne({
        companyName: adCompany.companyName,
      }),
      this.userService.getUserById(userId),
    ]);
    if (existCompany) {
      throw new BadRequestException('The Ad Company specified already exist ');
    }
    if (!existUserAccount) {
      throw new NotFoundException('The User specified does not exist');
    }
    const createAdComp = {
      accountServiceManagerId: new Types.ObjectId(
        adCompany.accountServiceManagerId,
      ),
      companyName: adCompany.companyName,
      companyAbbreviation: adCompany.companyAbbreviation,
      adAccountManager: adCompany.adAccountManager,
      adAccountManagerEmail: adCompany.adAccountManagerEmail,
      adAccountManagerPhoneNumber: adCompany.adAccountManagerPhoneNumber,
      organizationId: adCompany?.organizationId
        ? new Types.ObjectId(adCompany.organizationId)
        : user?.organizationId
        ? new Types.ObjectId(user.organizationId)
        : null,
    };
    const createdAdCompany = this.adCompanyRepository.create(createAdComp);
    if (createdAdCompany) {
      const log = {
        userId: userId,
        message: ActionType.created_ad_company + ' ' + adCompany.companyName,
      };
      await this.activityLogService.saveActivityLog(log);
    }
    return createdAdCompany;
  }

  async updateAdCompany(
    id: string,
    data: UpdateAdCompanyDto,
    user: UserAuthInfo,
  ) {
    const loggedUser = new User(user as unknown as User);
    const userId = user._id;
    try {
      const existingAdCompany = await this.adCompanyRepository.findOneById({
        _id: new Types.ObjectId(id),
      });
      if (!existingAdCompany) {
        throw new NotFoundException('The adCompany specified does not exist');
      }
      if (existingAdCompany?.organizationId) {
        if (
          !loggedUser.isAdmin() &&
          !loggedUser.isOrganizationOwner(existingAdCompany.organizationId) &&
          !loggedUser.isSuperAdmin()
        ) {
          throw new BadRequestException(
            'You are not allowed to edit this ad company, this ad company belongs to another organization',
          );
        }
      }

      if (!loggedUser.isAdmin() && !loggedUser.isSuperAdmin()) {
        throw new BadRequestException(
          'You are not allowed to edit this ad company, this ad company belongs to another organization',
        );
      }
      const updatedAdCompany = this.adCompanyRepository.updateOne(
        existingAdCompany._id,
        data,
      );
      if (updatedAdCompany) {
        const log = {
          userId: userId,
          message:
            ActionType.update_ad_company +
            ' ' +
            (await updatedAdCompany).companyName,
        };
        await this.activityLogService.saveActivityLog(log);
      }
      return updatedAdCompany;
    } catch (error) {
      throw error;
    }
  }

  async deleteAdCoompany(id: string, user): Promise<any> {
    const userId = user._id;
    try {
      const adCompany = await this.adCompanyRepository.findOneById({
        _id: new Types.ObjectId(id),
      });
      if (
        adCompany.organizationId.toHexString() !=
          user.organizationId.toHexString() &&
        !['admin', 'superAdmin'].includes(user.privilege)
      ) {
        throw new BadRequestException(
          'You are not allowed to delete this ad company, this ad company belongs to another organization',
        );
      }
      if (adCompany) {
        const deletedAdCompany = await this.adCompanyRepository.delete(
          adCompany._id,
        );

        if (deletedAdCompany) {
          const log = {
            userId: userId,
            message:
              ActionType.deleted_ad_company + ' ' + adCompany.companyName,
          };
          await this.activityLogService.saveActivityLog(log);
        }
        return deletedAdCompany;
      }
      if (!adCompany) {
        throw new NotFoundException('The adCompany specified does not exist');
      }
    } catch (error) {
      throw new NotFoundException('The adCompany specified does not exist');
    }
  }

  async findAllAdAccountsRelatedToAScreen(adScreen): Promise<AdAccount[]> {
    return this.addAccountRepository.getAdAccountsRelatedToScreen(
      new Types.ObjectId(adScreen),
    );
  }

  async findAdScreenId(id: string): Promise<AdAccount> {
    return this.addAccountRepository.retrieveAdScreen({
      _id: new Types.ObjectId(id),
    });
  }

  async displayCampaignSchedule(adScreen: string) {
    return this.addAccountRepository.campaignSchedule(
      new Types.ObjectId(adScreen),
    );
  }

  async removeManyAdAccounts(adScreen: string) {
    try {
      return this.addAccountRepository.deleteMany(adScreen);
    } catch (error) {
      throw new NotFoundException('The adScreen specified does not exist');
    }
  }

  async returnAllAdAccountsRelatedToAdScreen(adScreen: string) {
    const adAccounts = await this.addAccountRepository.find({
      adScreen: new Types.ObjectId(adScreen),
    });
    const adScreenIdsAndAccount = [];
    adAccounts.forEach((adAccount) => {
      adScreenIdsAndAccount.push({
        adScreen: adAccount.adScreen,
        adAccount: adAccount._id,
      });
    });
    return adScreenIdsAndAccount;
  }
}
