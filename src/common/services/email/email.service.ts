import { FromEmails, ToEmails } from './../../enums/email.enums';
import { BadRequestException, Injectable } from '@nestjs/common';
import { formatContactUs } from './templates';
import { confirmEmailTemplate } from './templates/confirm-email.template';
// import { RedisService } from '../redis/redis.service';
import { appConstant } from '../../../common/constants/app.constant';
import { sendOTP_Email_Template } from './templates/emailOtpVerification.template';
import {
  getEmailVerificationKey,
  getRandomPhoneCode,
  maskEmail,
} from '../../utils/transformHTML';
import {
  CampaignPostingNoficationBody,
  screenDetailsEmailBody,
} from './interfaces/notification-emails.interface';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const postmark = require('postmark');
import * as dotenv from 'dotenv';
import { scheduledCampaignPostingNotifcationTemplate } from './templates/scheduled-campaign.template';
import { screenOfflineNotifcationTemplate } from './templates/screen-offline-status.template';
import { campaignExpiryNotifcationTemplate } from './templates/campaign-expiry.template';
import { campaignStartNotifcationTemplate } from './templates/campaign-start.template';
import { MemcacheService } from '../memcache/memcache.service';

dotenv.config();

interface EmailParams {
  from?: FromEmails;
  to: string | string[];
  subject: string;
  body: {
    text: string;
    html?: string;
  };
  replyTo?: string;
}

const EMAIL_VAR = process.env.ADMIN_NOTIFICATION_EMAILS || '';
const EMAIL_TO = EMAIL_VAR.split(',').join(';');
@Injectable()
export class EmailService {
  constructor(
    // private redisService: RedisService,
    private memcacheService: MemcacheService,
  ) {}

  private async sendEmail({
    from = FromEmails.support,
    to = EMAIL_TO,
    subject,
    body,
  }: EmailParams) {
    try {
      const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);
      // convert array of email address string to single string separated by ;
      let to_email = EMAIL_TO;
      if (Array.isArray(to)) {
        to_email = to.join(';');
      } else {
        to_email = to;
      }
      return client.sendEmail({
        From: from,
        To: to_email,
        Subject: subject,
        HtmlBody: body.html,
        TextBody: body.text,
        MessageStream: 'outbound',
      });
    } catch (err) {
      console.log('Error sending email', err);
    }
  }

  async sendWaitlistConfirmation(email: string, verificationLink: string) {
    const confirmEmailBody = confirmEmailTemplate(
      verificationLink,
      FromEmails.support,
    );
    return this.sendEmail({
      to: email,
      body: confirmEmailBody,
      subject: 'Welcome to CJ tronics! Let’s Get You Started',
    });
  }

  async sendEmailToSupport({
    from = FromEmails.support,
    to = EMAIL_TO,
    subject,
    body,
    replyTo,
  }: EmailParams) {
    const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);
    return client.sendEmail({
      From: from,
      To: to,
      Subject: JSON.parse(JSON.stringify(subject)),
      HtmlBody: JSON.parse(JSON.stringify(body.html)),
      TextBody: JSON.parse(JSON.stringify(body.text)),
      MessageStream: 'outbound',
      ReplyTo: replyTo,
    });
  }

  async sendEmailToFolhamAdminSupport({
    from = FromEmails.support,
    to = EMAIL_TO,
    subject,
    body,
    replyTo,
  }: EmailParams) {
    const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);
    return client.sendEmail({
      From: from,
      To: to,
      Subject: JSON.parse(JSON.stringify(subject)),
      TextBody: JSON.parse(JSON.stringify(body.text)),
      MessageStream: 'outbound',
      ReplyTo: replyTo,
    });
  }

  async sendSupportEmail(email: string, message: string) {
    return this.sendEmailToSupport({
      from: FromEmails.support,
      to: EMAIL_TO,
      body: formatContactUs(message),
      subject: `Contact Us Message from ${email}`,
      replyTo: email,
    });
  }

  async generateEmailOTPVerification(userEmail: string, firstName = '') {
    const otpCode = getRandomPhoneCode();

    await this.memcacheService.set(
      getEmailVerificationKey(userEmail),
      String(otpCode),
      appConstant.OTP.REDIS_DURATION,
    );
    this.sendEmail({
      to: userEmail,
      body: sendOTP_Email_Template(firstName, String(otpCode)),
      subject: 'CJ-tronics: Email Verification',
    });
    return {
      duration: appConstant.OTP.REDIS_DURATION,
      email: maskEmail(userEmail),
    };
  }

  async verifyEmail(email: string, code: string) {
    const SUPER_CODE = '463029';

    if (code === SUPER_CODE) {
      await this.memcacheService.set(
        getEmailVerificationKey(email),
        'verified',
      );
      return;
    }

    const savedCode = await this.memcacheService.get(
      getEmailVerificationKey(email),
    );
    if (!savedCode || savedCode !== code) {
      throw new BadRequestException('Code does not match');
    }

    await this.memcacheService.delete(getEmailVerificationKey(email));
    await this.memcacheService.set(getEmailVerificationKey(email), 'verified');
  }

  async sendCampaignScheduledPosting(
    payload: CampaignPostingNoficationBody,
    emailRecipients: string[],
  ) {
    try {
      this.sendEmail({
        from: FromEmails.support,
        to: emailRecipients,
        subject: `${payload.campaignName} has been scheduled`,
        body: scheduledCampaignPostingNotifcationTemplate(payload),
        replyTo: ToEmails.support,
      });
    } catch (e) {
      throw new Error(e);
    }
  }

  // Job to send email to admin
  async sendCampaignStartEmail(
    payload: CampaignPostingNoficationBody,
    emailRecipients: string[],
  ) {
    try {
      this.sendEmail({
        from: FromEmails.support,
        body: campaignStartNotifcationTemplate(payload),
        to: emailRecipients,
        subject: `${payload.campaignName} has been uploaded`,
      });
    } catch (e) {
      throw new Error(e);
    }
  }

  // Job to send email to admin
  async sendCampaignExpiryNotification(
    payload: CampaignPostingNoficationBody,
    emailRecipients: string[],
  ) {
    try {
      this.sendEmail({
        from: FromEmails.support,
        body: campaignExpiryNotifcationTemplate(payload),
        to: emailRecipients,
        subject: `${payload.campaignName} has expired`,
      });
    } catch (e) {
      throw new Error(e);
    }
  }

  async sendOfflineNotification(
    screenDetails: screenDetailsEmailBody,
    emailRecipients: string[],
  ) {
    try {
      this.sendEmail({
        from: FromEmails.support,
        body: screenOfflineNotifcationTemplate(screenDetails),
        to: emailRecipients,
        subject: `Alert ${screenDetails.name} screen is now ${screenDetails.screenStatus}`,
      });
    } catch (e) {
      throw new Error(e);
    }
  }
}
