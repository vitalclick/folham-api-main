import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AdAccountsDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  adCompany: string;

  @ApiProperty()
  @IsString()
  adScreen: string;

  @ApiProperty()
  @IsString()
  adAccountName: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organizationId?: string;
}
