import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';
import { AdFileDto } from './ad-file.dto';

export class AdsDto {
  @ApiProperty()
  @IsString()
  adAccount: string;

  @ApiProperty({ type: [AdFileDto] })
  @IsArray()
  adFile: [AdFileDto];
}
