import { PartialType } from '@nestjs/swagger';
import { CreateCampaignActivityDto } from './create-campaign-activity.dto';

export class UpdateCampaignActivityDto extends PartialType(
  CreateCampaignActivityDto,
) {}
