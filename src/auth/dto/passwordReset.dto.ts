import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { appConstant } from '../../common/constants/app.constant';

export class PasswordResetDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(appConstant.REGEX.PASSWORD)
  password: string;
}
