import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { LayoutType, Status } from '../types/ad-screen.types';

export class AdScreenDto {
  @ApiProperty()
  @IsString()
  screenId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEnum(Status)
  @IsString()
  status: string;

  @ApiProperty()
  @IsEnum(LayoutType)
  @IsString()
  layout: string;

  @ApiProperty()
  @IsNumber()
  height: number;

  @ApiProperty()
  @IsNumber()
  width: number;

  @ApiProperty()
  @IsString()
  deviceId: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  scrollingAds?: boolean;
}
