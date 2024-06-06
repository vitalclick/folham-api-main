import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { adType } from '../schema/scrolling-ads.schema';

export class CreateScrollingAdsDto {
  @ApiProperty()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsString()
  @IsEnum(adType)
  type: adType;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  screenIds: string[];

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  startTime = new Date().toISOString();

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  endTime = new Date().toISOString();
}

export class ModifyScrollingAdsDto {
  @ApiProperty()
  @IsArray()
  screenId: string;
}
