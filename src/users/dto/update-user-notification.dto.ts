import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UpdateUserNotificationTypeDto } from './update-user-notification-type.dto';

export class UpdateUserNotificationDto {
  @ApiPropertyOptional({ type: UpdateUserNotificationTypeDto })
  @IsOptional()
  someoneFollowsYou: UpdateUserNotificationTypeDto;

  @ApiPropertyOptional({ type: UpdateUserNotificationTypeDto })
  @IsOptional()
  newEpisodes: UpdateUserNotificationTypeDto;

  @ApiPropertyOptional({ type: UpdateUserNotificationTypeDto })
  @IsOptional()
  receiveSharedItem: UpdateUserNotificationTypeDto;

  @ApiPropertyOptional({ type: UpdateUserNotificationTypeDto })
  @IsOptional()
  newLogin: UpdateUserNotificationTypeDto;

  @ApiPropertyOptional({ type: UpdateUserNotificationTypeDto })
  @IsOptional()
  tipsFromCJtronics: UpdateUserNotificationTypeDto;

  @ApiPropertyOptional({ type: UpdateUserNotificationTypeDto })
  @IsOptional()
  podcastMilestones: UpdateUserNotificationTypeDto;
}
