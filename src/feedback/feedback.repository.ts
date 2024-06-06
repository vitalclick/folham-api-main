import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Feedback, FeedbackDocument } from './schemas/feedback.schema';
import { FeedbackType } from '../common/enums/feedback.enum';

export interface FeedbackPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  message: string;
  type: FeedbackType;
}

@Injectable()
export class FeedbackRepository {
  constructor(
    @InjectModel(Feedback.name)
    private feedbackModel: Model<FeedbackDocument>,
  ) {}

  public async create(payload: FeedbackPayload): Promise<Feedback> {
    return this.feedbackModel.create(payload);
  }
}
