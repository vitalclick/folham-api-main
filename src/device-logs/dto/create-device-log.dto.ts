import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { MessageType } from '../types/device-log-message.type';

export class CreateDeviceLogDto {
  @ApiProperty()
  @IsString()
  adId: string;

  @ApiProperty()
  @IsString()
  accountId: string;

  @ApiProperty()
  @IsString()
  campaignId: string;

  @ApiProperty()
  @IsString()
  deviceId: string;

  @ApiProperty()
  @IsEnum(MessageType)
  messageType: MessageType;

  @ApiProperty()
  @IsString()
  loggedOn: string;
}
