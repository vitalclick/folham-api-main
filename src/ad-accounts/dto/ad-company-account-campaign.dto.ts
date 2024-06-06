import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class AdCompanyAccountsAndCampaignsDto {
  @ApiProperty()
  @IsString()
  company: string;

  @ApiProperty()
  @IsArray()
  accountAndCampaigns: [AdAccountAndCampaigns];
}

export class AdAccountAndCampaigns {
  @ApiProperty()
  @IsString()
  account: string;

  @ApiProperty()
  @IsArray()
  campaigns: [AdAccountCampaigns];
}

export class AdAccountCampaigns {}
