import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CampaignActivityDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  campaignId: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty()
  @IsString()
  createdAt: Date;
}
