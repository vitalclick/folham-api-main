import {
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CampaignRepository } from './campaign.repository';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { Campaign } from './schema/campaign.schema';
import { Types } from 'mongoose';
import { ActionType } from '../activity-log/types/action-type.types';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { CampaignSequenceDto } from './dto/campaign-sequence.dto';
import { AdAccountsService } from '../ad-accounts/ad-accounts.service';
import { CampaignActivityService } from '../campaign-activity/campaign-activity.service';
import { UsersService } from '../users/users.service';
import { CampaignActivityType } from '../campaign-activity/types/campaign-activity.type';
import { AdScreensService } from '../ad-screens/ad-screens.service';
import { CampaignPostingNoficationBody } from '../common/services/email/interfaces/notification-emails.interface';
import { EmailService } from '../common/services/email/email.service';
import { UserAuthInfo } from '../users/interface/user.interface';
import { AdminAccess } from '../users/types/users.types';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class CampaignService {
  constructor(
    private campaignRepository: CampaignRepository,
    private campaignActivity: CampaignActivityService,
    private activityLogService: ActivityLogService,
    private userService: UsersService,
    @Inject(forwardRef(() => AdAccountsService))
    private adAccountService: AdAccountsService,
    @Inject(forwardRef(() => AdScreensService))
    private adScreenService: AdScreensService,
    private emailService: EmailService,
  ) {}

  async create(campaign: CreateCampaignDto, userDetails): Promise<Campaign> {
    const userId = userDetails._id;
    const loggedUser = new User(userDetails as any as User);

    try {
      let organizationId;
      const campaignAdScreenDetails = await this.adAccountService.findOneById(
        campaign.adAccount,
        userDetails,
      );
      if (!campaignAdScreenDetails || !campaignAdScreenDetails?.adScreen) {
        throw new NotFoundException(
          'The ad account specified does not exist or have any ad screen',
        );
      }
      const campaignAdScreenId = campaignAdScreenDetails.adScreen;
      const campaignAdScreen = await this.adScreenService.findDeviceById(
        campaignAdScreenId.toHexString(),
      );
      const adFiles = campaign.adFiles.map((file) => new Types.ObjectId(file));
      const createdCampaignData = {
        adAccount: new Types.ObjectId(campaign.adAccount),
        adScreen: campaignAdScreenId,
        name: campaign.name,
        startDate: new Date(campaign.startDate),
        endDate: new Date(campaign.endDate),
        startTime: campaign.startTime,
        endTime: campaign.endTime,
        videoAndImageDuration: campaign.videoAndImageDuration,
        campaignScheduleDays: campaign.campaignScheduleDays,
        adFiles: adFiles,
        organizationId: campaignAdScreenDetails.organizationId
          ? campaignAdScreenDetails.organizationId
          : userDetails.organizationId
          ? userDetails.organizationId
          : null,
        screenViewPort: campaign.screenViewPort,
      };
      if (createdCampaignData.startTime > createdCampaignData.endTime) {
        throw new NotFoundException(
          'Start time cannot be greater than end time',
        );
      }
      const [createdCampaign, user] = await Promise.all([
        this.campaignRepository.create(createdCampaignData),
        this.userService.getUserById(userId),
      ]);

      if (createdCampaign) {
        const log = {
          userId: userId,
          message: ActionType.create_new_campaign + ': ' + createdCampaign.name,
        };
        const campaignActivity = {
          userId: userId,
          campaignId: createdCampaign._id,
          message:
            user.firstName +
            ' ' +
            CampaignActivityType.create_new_campaign +
            ': ' +
            createdCampaign.name,
        };
        const notificationData: CampaignPostingNoficationBody = {
          campaignName: createdCampaign.name,
          screenName: campaignAdScreen.name,
          playDuration: createdCampaign.videoAndImageDuration,
          title: 'Notification: Campaign Created and Scheduled',
          startTime: createdCampaign.startTime,
          endTime: createdCampaign.endTime,
          startDate: createdCampaign.startDate.toDateString(),
          endDate: createdCampaign.endDate.toDateString(),
        };

        // Determine the recipients of the email
        let emailRecipients: string[] = [];

        if (loggedUser.isSuperAdmin()) {
          // If the creator is a super admin, send the email to all super admins
          emailRecipients = await this.userService.getAllSuperAdminEmails();
        } else if (loggedUser.isAdmin() && loggedUser.organizationId) {
          // If the creator is an admin with an organization, send the email to all admins in the organization
          emailRecipients =
            await this.userService.getAllAdminEmailsInOrganization(
              loggedUser.organizationId,
            );
        }

        // Send emails to the recipients
        await Promise.all([
          this.activityLogService.saveActivityLog(log),
          this.campaignActivity.saveCampaignActivity(campaignActivity),
          this.emailService.sendCampaignScheduledPosting(
            notificationData,
            emailRecipients,
          ),
        ]);
      }

      return createdCampaign;
    } catch (error) {
      throw error;
    }
  }

  async findOneById(id: string, user): Promise<Campaign> {
    try {
      const campaign = await this.campaignRepository.findOne({
        _id: new Types.ObjectId(id),
      });
      if (!campaign) {
        throw new NotFoundException('The campaign specified does not exist');
      }
      if (
        campaign.organizationId.toHexString() !==
          user.organizationId.toHexString() &&
        !['admin', 'superAdmin'].includes(user.privilege)
      ) {
        throw new NotFoundException(
          'The campaign specified does not exist in your organization',
        );
      }
      return campaign;
    } catch (error) {
      throw new NotFoundException('The Campaign specified does not exist');
    }
  }

  async findOneByIdForDevice(id: string): Promise<Campaign> {
    try {
      const campaign = await this.campaignRepository.findOne({
        _id: new Types.ObjectId(id),
      });
      if (!campaign) {
        throw new NotFoundException('The campaign specified does not exist');
      }

      return campaign;
    } catch (error) {
      throw new NotFoundException('The Campaign specified does not exist');
    }
  }

  async findAll(user): Promise<Campaign[]> {
    return this.campaignRepository.find(user);
  }

  async update(id: string, data: UpdateCampaignDto, user) {
    const loggedUser = new User(user as any);
    const userId = user._id;
    const existinCampaign = await this.campaignRepository.findOneById({
      _id: new Types.ObjectId(id),
    });

    if (!existinCampaign) {
      throw new NotFoundException('The Campaign specified does not exist');
    }
    if (
      !loggedUser.isOrganizationOwner(existinCampaign?.organizationId) &&
      !loggedUser.isAdmin() &&
      !loggedUser.isSuperAdmin()
    ) {
      throw new Error(
        'The campaign specified does not exist in your organization',
      );
    }
    if (!data.screenViewPort) {
      data.screenViewPort = 1;
    }
    try {
      const updatedCampaign = await this.campaignRepository.updateOne(
        existinCampaign._id,
        data,
      );

      if (updatedCampaign) {
        const log = {
          userId: userId,
          message: ActionType.update_campaign + ': ' + existinCampaign.name,
        };
        const campaignActivity = {
          userId: userId,
          campaignId: updatedCampaign._id,
          message:
            user.firstName +
            ' ' +
            CampaignActivityType.update_campaign +
            ': ' +
            updatedCampaign.name,
        };
        await Promise.all([
          this.activityLogService.saveActivityLog(log),
          this.campaignActivity.saveCampaignActivity(campaignActivity),
        ]);
      }
      return updatedCampaign;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async delete(id: string, user: UserAuthInfo): Promise<any> {
    try {
      const campaign = await this.campaignRepository.findOneById({
        _id: new Types.ObjectId(id),
      });
      if (!campaign) {
        return {
          error: true,
          message: 'The campaign specified does not exist',
          statusCode: HttpStatus.NOT_MODIFIED,
        };
      }
      if (campaign.adFiles && campaign.adFiles.length > 0) {
        return {
          error: true,
          message: 'Campaign cannot be deleted because it has ad files',
          statusCode: HttpStatus.NOT_MODIFIED,
        };
      }

      const toRemove = await this.campaignRepository.delete({
        _id: new Types.ObjectId(id),
      });
      return {
        error: false,
        statusCode: HttpStatus.OK,
        message: 'Campaign deleted successfully',
      };
    } catch (error) {
      return {
        error: true,
        message: 'Error deleting the campaign specified',
        statusCode: HttpStatus.NOT_MODIFIED,
      };
    }
  }

  async countCampaign(user: UserAuthInfo): Promise<number> {
    const loggedUser = new User(user as any);
    if (!loggedUser.isSuperAdmin()) {
      return this.campaignRepository.count({
        organizationId: new Types.ObjectId(user.organizationId),
      });
    }
    return this.campaignRepository.count({});
  }

  async getCampaignScheduleDisplay(adscreen) {
    const campaign = await this.campaignRepository.campaignAdScreenAndAccount(
      new Types.ObjectId(adscreen),
    );
    return campaign;
  }

  async countActiveCampaigns(user: UserAuthInfo) {
    const loggedUser = new User(user as any);
    if (!loggedUser.isSuperAdmin()) {
      return this.campaignRepository.countActiveCampaigns({
        organizationId: new Types.ObjectId(user.organizationId),
      });
    }
    return this.campaignRepository.countActiveCampaigns({});
  }

  async getScreenAdAccounts(adScreenId: string) {
    return this.campaignRepository.groupAdAccountByAdScreen(adScreenId);
  }
  async getAdScreenCampaignSchedule(adScreenId: string) {
    const campaigns = await this.campaignRepository.groupAdAccountByAdScreen(
      adScreenId,
    );
    return;
  }

  async sequenceCampaignByOrder(sequenceDto: [CampaignSequenceDto]) {
    const campaigns = [];

    for (let i = 0; i < sequenceDto.length; i++) {
      const campaign = sequenceDto[i];
      const campaignOne = await this.campaignRepository.updateOne(
        new Types.ObjectId(campaign.campaignId),
        {
          order: campaign.order,
        },
      );
      const camp = {
        _id: campaignOne._id,
        name: campaignOne.name,
        adAccountName: campaignOne.order,
      };
      campaigns.push(camp);
    }

    return campaigns;
  }

  async getCampaignByAdAccount(adAccount: string) {
    try {
      const campaign = await this.campaignRepository.findOne({
        adAccount,
      });
      return campaign;
    } catch (error) {
      throw new NotFoundException(
        'The ad account specified does not exist on campaign document',
      );
    }
  }

  async getCampaignsCountByAdAccount(adAccount: string) {
    try {
      const campaign = await this.campaignRepository.countCampaignsByAdAccount(
        new Types.ObjectId(adAccount),
      );
      return campaign;
    } catch (error) {
      throw new NotFoundException(
        'The ad account specified does not exist on campaign document',
      );
    }
  }

  async findCampaignsByAdccount(adAccount: string) {
    try {
      const campaign = await this.campaignRepository.getCampaignsByAdAccount(
        new Types.ObjectId(adAccount),
      );
      return campaign;
    } catch (error) {
      throw new NotFoundException(
        'The ad account specified does not exist on campaign document',
      );
    }
  }

  async getCampaignInfoAndAdverts(id: string) {
    return this.campaignRepository.getCampaignAndAdverts(id);
  }

  async deleteManyCampaignsByAdScreen(adScreen: string) {
    try {
      return this.campaignRepository.deleteMany(adScreen);
    } catch (error) {
      throw new NotFoundException(
        'The ad screen specified does not exist on campaign document',
      );
    }
  }
  async processExpiredCampaigns() {
    const campaigns =
      await this.campaignRepository.findCampaignExpiringWithinTheNext24Hours();
    if (!campaigns) return;
    for (const campaign of campaigns) {
      const notification: CampaignPostingNoficationBody = {
        campaignName: campaign.name,
        screenName: campaign.screenName,
        playDuration: campaign.videoAndImageDuration,
        endTime: campaign.endTime,
        startTime: campaign.startTime,
        endDate: campaign.endDate.toDateString(),
        startDate: campaign.startDate.toDateString(),
        title: `Notification: Campaign ${campaign.name} is about to expire`,
      };

      // Determine the email recipients based on the campaign's organization
      let emailRecipients: string[] = [];

      if (campaign.organizationId) {
        // If the campaign belongs to an organization, send the email to all admins in that organization
        emailRecipients =
          await this.userService.getAllAdminEmailsInOrganization(
            campaign.organizationId,
          );
      } else {
        // If the campaign has no organization, send the email to all super admins
        emailRecipients = await this.userService.getAllSuperAdminEmails();
      }

      // Send the notification email to the appropriate recipients
      this.emailService.sendCampaignExpiryNotification(
        notification,
        emailRecipients,
      );
    }
  }

  async processCampaignsStartingToday() {
    const campaigns =
      await this.campaignRepository.findCampaignStartingWithinTheNext12Hours();
    if (!campaigns) return;
    for (const campaign of campaigns) {
      const notification: CampaignPostingNoficationBody = {
        campaignName: campaign.name,
        screenName: campaign.screenName,
        playDuration: campaign.videoAndImageDuration,
        endTime: campaign.endTime,
        startTime: campaign.startTime,
        endDate: campaign.endDate.toDateString(),
        startDate: campaign.startDate.toDateString(),
        title: `Notification: Campaign ${campaign.name} is starting today`,
      };

      // Determine the email recipients based on the campaign's organization
      let emailRecipients: string[] = [];

      if (campaign.organizationId) {
        // If the campaign belongs to an organization, send the email to all admins in that organization
        emailRecipients =
          await this.userService.getAllAdminEmailsInOrganization(
            campaign.organizationId,
          );
      } else {
        // If the campaign has no organization, send the email to all super admins
        emailRecipients = await this.userService.getAllSuperAdminEmails();
      }

      // Send the notification email to the appropriate recipients
      this.emailService.sendCampaignStartEmail(notification, emailRecipients);
    }
  }
}
