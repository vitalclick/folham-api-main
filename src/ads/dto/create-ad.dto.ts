import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { AdFileDto } from './ad-file.dto';

export class CreateAdDto {
  @ApiProperty()
  @IsString()
  adAccount: string;

  @ApiProperty({ type: [AdFileDto] })
  @IsArray()
  adFile: AdFileDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organizationId?: string;
}
