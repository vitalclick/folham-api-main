import { Feedback, FeedbackSchema } from './schemas/feedback.schema';
import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedbackRepository } from './feedback.repository';
import { EmailService } from '../common/services/email/email.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Feedback.name, schema: FeedbackSchema },
    ]),
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService, FeedbackRepository, EmailService],
  exports: [FeedbackService],
})
export class FeedbackModule {}
