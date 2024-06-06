import { AdminAccess, GenderType, PronounsType } from './../types/users.types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserType } from '../types/users.types';
import { UpdateSocialNetworkDto } from './update-social-network.dto';
import { UpdateUserLocaleDto } from './update-user-locale.dto';
import { UpdateUserNotificationDto } from './update-user-notification.dto';
import { Types } from 'mongoose';

export class UserProfileDto {
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
  userActiveStatus: number;

  @ApiProperty()
  type: UserType;
  @ApiProperty()
  privilege: AdminAccess;

  @ApiProperty()
  createdAt?: Date;

  @ApiProperty()
  @IsOptional()
  organizationId?: Types.ObjectId;
}
