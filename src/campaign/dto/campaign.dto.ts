import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsNumber, IsString } from 'class-validator';

export class CampaignDto {
  @ApiProperty()
  @IsString()
  adAccount: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsDateString()
  startDate: Date;

  @ApiProperty()
  @IsDateString()
  endDate: Date;

  @ApiProperty()
  @IsNumber()
  videoAndImageDuration: number;

  @ApiProperty()
  @IsString()
  startTime: string;

  @ApiProperty()
  @IsString()
  endTime: string;

  @ApiProperty()
  @IsArray()
  campaignScheduleDays: [string];

  @ApiProperty()
  @IsArray()
  adFiles: [string];

  @ApiProperty()
  campaignActiveStatus: number;
}
