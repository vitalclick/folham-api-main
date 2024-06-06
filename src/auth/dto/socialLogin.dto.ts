import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SocialLoginDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  accessToken: string;

  @ApiProperty()
  @IsString()
  socialLoginType: string;

  @ApiProperty()
  @IsString()
  socialId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  oauthToken: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  oauthTokenSecret: string;

  @ApiPropertyOptional()
  @IsOptional()
  extraData: {
    firstName?: string;
    lastName?: string;
  };
}
