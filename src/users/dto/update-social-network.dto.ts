import { IsString, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SocialNetworkType } from '../types/users.types';

export class UpdateSocialNetworkDto {
  @ApiProperty({ enum: SocialNetworkType })
  @IsEnum(SocialNetworkType)
  name: SocialNetworkType;

  @ApiProperty()
  @IsString()
  url: string;

  @ApiProperty()
  @IsBoolean()
  visible: boolean;
}
