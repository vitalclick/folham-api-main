import { EmailService } from './../common/services/email/email.service';
import { Feedback } from './schemas/feedback.schema';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FeedbackRepository } from './feedback.repository';
import { Injectable } from '@nestjs/common';
import { feedbackTemplate } from '../common/services/email/templates/feedback.template';
import { ToEmails } from '../common/enums/email.enums';
import { User } from '../users/schemas/user.schema';
@Injectable()
export class FeedbackService {
  constructor(
    private feedbackRepository: FeedbackRepository,
    private emailService: EmailService,
  ) {}

  async createFeedback(
    user: User,
    createFeedbackDto: CreateFeedbackDto,
  ): Promise<Feedback> {
    const createdFeedback = await this.feedbackRepository.create({
      ...createFeedbackDto,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
    await this.emailService.sendEmailToSupport({
      body: feedbackTemplate(
        user.firstName,
        user.lastName,
        user.email,
        createFeedbackDto.type,
        createFeedbackDto.message,
      ),
      subject: `${createFeedbackDto.type.toUpperCase()} Email`,
      to: ToEmails.support,
    });
    return createdFeedback;
  }
}
