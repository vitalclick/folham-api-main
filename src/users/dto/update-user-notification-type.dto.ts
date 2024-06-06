import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserNotificationTypeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  push?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  email?: boolean;
}
