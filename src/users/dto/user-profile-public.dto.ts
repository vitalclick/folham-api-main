import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString } from 'class-validator';
import { GenderType, PronounsType, UserType } from '../types/users.types';
import { UpdateUserLocaleDto } from './update-user-locale.dto';
import { UpdateSocialNetworkDto } from './update-social-network.dto';

export class UserProfilePublicDto {
  @ApiProperty()
  _id?: string;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  type: UserType;
}
