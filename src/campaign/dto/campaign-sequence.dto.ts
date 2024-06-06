import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CampaignSequenceDto {
  @ApiProperty()
  @IsString()
  campaignId: string;

  @ApiProperty()
  @IsNumber()
  order: number;
}
