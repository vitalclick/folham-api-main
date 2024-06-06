import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateAdCompanyDto {
  @ApiProperty()
  @IsString()
  companyName: string;

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
  @IsString()
  accountServiceManagerId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organizationId?: string;
}
