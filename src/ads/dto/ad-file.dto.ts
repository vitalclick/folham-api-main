import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { AdType } from '../types/ads.type';

export class AdFileDto {
  @ApiProperty()
  @IsEnum(AdType)
  @IsString()
  adType: AdType;

  @ApiProperty()
  @IsString()
  adUrl: string;

  @ApiProperty()
  @IsString()
  adName: string;
}
