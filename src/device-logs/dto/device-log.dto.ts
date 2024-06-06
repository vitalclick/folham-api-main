import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { MessageType } from '../types/device-log-message.type';

export class DeviceLogDto {
  @ApiProperty()
  @IsString()
  adId: string;

  @ApiProperty()
  @IsString()
  campaignId: string;

  @ApiProperty()
  @IsString()
  accountId: string;

  @ApiProperty()
  @IsString()
  screenId: string;

  @ApiProperty()
  @IsEnum(MessageType)
  messageType: MessageType;
}
