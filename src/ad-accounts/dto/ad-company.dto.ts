import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AdCompanyDto {
  @ApiProperty()
  @IsString()
  companyName: string;

  // @ApiProperty()
  // @IsString()
  // companyEmail: string;

  // @ApiProperty()
  // @IsString()
  // companyPhoneNumber: string;

  // @ApiProperty()
  // @IsString()
  // companyWebsite: string;

  // @ApiProperty()
  // @IsString()
  // companyLogoUrl: string;

  @ApiProperty()
  @IsString()
  companyAbbreviation: string;

  @ApiProperty()
  @IsString()
  adAccountManager: string;

  @ApiProperty()
  @IsString()
  adAccountManagerEmail: string;

  @ApiProperty()
  @IsString()
  adAccountManagerPhoneNumber: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organizationId?: string;
}
