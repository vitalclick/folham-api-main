import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { PagingOptions } from '../activity-log/types/paging-options.types';
import { CampaignService } from '../campaign/campaign.service';
import { DeviceLogsRepository } from './device-logs.repository';
import { CreateDeviceLogDto } from './dto/create-device-log.dto';
import { DeviceSearchQuery } from './dto/device-search-query.dto';
import { DeviceLog } from './schema/device-log.schema';
import { Types } from 'mongoose';
import { AdAccountsService } from '../ad-accounts/ad-accounts.service';
import { AdScreensService } from '../ad-screens/ad-screens.service';
import { DateTime, Interval } from 'luxon';
import { DeviceStatus } from './types/device-log-message.type';
// import { ScreenStatusQueueService } from '../queues/screen-status.service';
import { EmailService } from '../common/services/email/email.service';
import { screenDetailsEmailBody } from '../common/services/email/interfaces/notification-emails.interface';
import { DeviceLogDto } from '../queues/log-queue.service';
import { UserAuthInfo } from '../users/interface/user.interface';
import { User } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { MemcacheService } from '../common/services/memcache/memcache.service';
import { EventsGateway } from 'src/queues/event-gateway/events.gateway';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-2' });

@Injectable()
export class DeviceLogsService {
  constructor(
    private deviceLogRepository: DeviceLogsRepository,
    @Inject(forwardRef(() => CampaignService))
    private campaignService: CampaignService,
    @Inject(forwardRef(() => AdAccountsService))
    private accountService: AdAccountsService,
    private screenService: AdScreensService,
    // private screenStatusQueueService: ScreenStatusQueueService,
    // private redisService: RedisService,
    private emailService: EmailService,
    private userService: UsersService,
    private memcacheService: MemcacheService,
    @Inject(forwardRef(() => EventsGateway))
    private eventsGateway: EventsGateway,
  ) {}

  async create(logDto: CreateDeviceLogDto): Promise<DeviceLog> {
    const deviceLog = new DeviceLog();
    const account = await this.accountService.findAdScreenId(logDto.accountId);
    deviceLog.messageType = logDto.messageType;
    deviceLog.campaignId = new Types.ObjectId(logDto.campaignId);
    deviceLog.screenId = new Types.ObjectId(account.adScreen);
    deviceLog.accountId = new Types.ObjectId(logDto.accountId);
    deviceLog.adId = logDto.adId;
    deviceLog.loggedOn = new Date(logDto.loggedOn);
    return this.deviceLogRepository.create(deviceLog);
  }

  async createLogs(logDto: DeviceLogDto): Promise<DeviceLog> {
    const deviceLog = new DeviceLog();
    const account = await this.accountService.findAdScreenId(logDto.accountId);
    deviceLog.messageType = logDto.messageType;
    deviceLog.campaignId = new Types.ObjectId(logDto.campaignId);
    deviceLog.screenId = new Types.ObjectId(account.adScreen);
    deviceLog.accountId = new Types.ObjectId(logDto.accountId);
    deviceLog.adId = logDto.adId;
    deviceLog.loggedOn = new Date(logDto.loggedOn);
    return this.deviceLogRepository.create(deviceLog);
  }

  async getScreenAliveStatus() {
    const screens = await this.memcacheService.get('screenStatus');
    if (!screens) {
      return [];
    }
    return JSON.parse(screens);
  }

  async getDeviceLogs(
    user: UserAuthInfo,
    pagination: PagingOptions,
    query?: DeviceSearchQuery,
  ): Promise<DeviceLog[]> {
    const logged = new User(user as any);
    if (!query.accountId && !query.screenId) {
      throw new BadRequestException('Invalid Query selected');
    }
    const dbquery = {};
    if ((!logged.isAdmin() || !logged.isSuperAdmin()) && !query.screenId) {
      console.log('here');
      return [];
    }
    if ((!logged.isAdmin() || !logged.isSuperAdmin()) && query.screenId) {
      // dbquery['organizationId'] = logged.organizationId;
      console.log('here ! admin');
    }

    if (query.accountId) {
      dbquery['accountId'] = new Types.ObjectId(query.accountId);
    }
    if (query.screenId) {
      dbquery['screenId'] = new Types.ObjectId(query.screenId);
    }
    pagination.skip = 0;
    pagination.limit = 6000;
    if (query.startDate) {
      const startDate = new Date(query.startDate);
      const endtime = query.startDate.split('T')[0] + 'T23:59:59.999Z'; // done to make sure only one day is selected
      const endDate = new Date(endtime);
      const addDate = {
        loggedOn: {
          $gte: startDate,
          $lte: endDate,
        },
      };
      dbquery['loggedOn'] = addDate.loggedOn;

      console.log('got here before find');
      return this.deviceLogRepository.find(dbquery, pagination);
    }
    console.log('got here after find', dbquery, pagination);
    return this.deviceLogRepository.find(dbquery, pagination);
  }

  async getCampaignHistory(pagination: PagingOptions) {
    const logs = await this.deviceLogRepository.find({}, pagination);

    const campaignHistories = await Promise.all(
      logs.map(async (log) => {
        const [campaign, screen] = await Promise.all([
          this.campaignService.findOneByIdForDevice(
            log.campaignId.toHexString(),
          ),
          this.screenService.findOneByIdForDevice(log.screenId.toHexString()),
        ]);

        if (campaign && screen) {
          const campaignHistory = {
            message:
              campaign.name +
              ' ' +
              log.messageType +
              'ed on screen' +
              screen.adScreenDetails.name,
            date: campaign.startDate,
            time: campaign.startTime,
          };
          return campaignHistory;
        } else {
          return null;
        }
      }),
    );

    return campaignHistories;
  }

  async getTotalCampaignPlayedTimes(user: UserAuthInfo) {
    const loggedUser = new User(user as any);
    let totalCampaignPlayedTimes = 0;
    if (!loggedUser.isAdmin() && !loggedUser.isSuperAdmin()) {
      totalCampaignPlayedTimes = await this.deviceLogRepository.countLogs({
        organizationID: loggedUser.organizationId,
        messageType: 'play',
      });
    } else {
      totalCampaignPlayedTimes = await this.deviceLogRepository.countLogs({
        messageType: 'play',
      });
    }
    return totalCampaignPlayedTimes;
  }

  async logsCount() {
    return this.deviceLogRepository.count();
  }

  async getScreenStatus(user?: UserAuthInfo, isSuperAdmin = false) {
    const screens = await this.screenService.getAllUniqueScreenIds(
      user,
      isSuperAdmin,
    );
    const screenStatus = await Promise.all(
      screens.map(async (screen) => {
        let status = DeviceStatus.offline;
        const log: any = await this.deviceLogRepository.getLiveScreens(
          screen.id,
        );
        if (!log) {
          return {
            id: screen.id,
            screenId: screen.screenId,
            screenName: screen.name,
            status: DeviceStatus.offline,
            device: screen.deviceId,
          };
        }
        const date1 = DateTime.fromJSDate(log.createdAt);
        const date2 = DateTime.now();
        const newtimeDiff = Interval.fromDateTimes(date1, date2).length(
          'minutes',
        );

        if (newtimeDiff <= 5) {
          status = DeviceStatus.online;
        }

        // Determine the email recipients based on the screen's organization
        let emailRecipients: string[] = [];

        if (screen.organizationId) {
          // If the screen belongs to an organization, send the email to all admins in that organization
          emailRecipients =
            await this.userService.getAllAdminEmailsInOrganization(
              screen.organizationId,
            );
        } else {
          // If the screen has no organization, send the email to all super admins
          emailRecipients = await this.userService.getAllSuperAdminEmails();
        }
        return {
          id: screen.id,
          screenId: screen.screenId,
          screenName: screen.name,
          status: status,
          device: screen.deviceId,
          sendEmailNotification: screen.sendEmailNotification,
          emailRecipients: emailRecipients,
        };
      }),
    );

    if (await this.sendEmailCounter()) {
      // TODO: send email to folham admin
      screenStatus.map(async (screen) => {
        if (
          screen.status == DeviceStatus.offline &&
          screen.sendEmailNotification
        ) {
          const emailNotification: screenDetailsEmailBody = {
            name: screen.screenName,
            screenId: screen.screenId,
            screenStatus: screen.status,
            title: `Alert: ${screen.screenName} Screen is Offline`,
          };

          // Send email to the appropriate recipients
          this.emailService.sendOfflineNotification(
            emailNotification,
            screen.emailRecipients,
          );
        }
      });
    }
    return screenStatus;
  }

  async sendEmailCounter(): Promise<boolean> {
    const hour = DateTime.now().hour;

    const counter = await this.memcacheService.get('emailCounter');
    if (!counter) {
      await this.memcacheService.set('emailCounter', 1);
      return true;
    }
    if (parseInt(counter) >= 20 && hour >= 6 && hour <= 22) {
      await this.memcacheService.set('emailCounter', 0);
      return true;
    }
    const newCounter = parseInt(counter) + 1;
    await this.memcacheService.set('emailCounter', newCounter);
    return false;
  }
  async deleteOldLogs() {
    return this.deviceLogRepository.deleteOldLogsBatched();
  }
}
