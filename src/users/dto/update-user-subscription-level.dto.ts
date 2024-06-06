import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEnum, IsNotEmpty } from 'class-validator';
import { UserSubscriptionLevel } from '../types/users.types';

export class UpdateUserSubscriptionLevelDto {
  @ApiProperty({ enum: Object.values(UserSubscriptionLevel) })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(UserSubscriptionLevel)
  userSubscriptionLevel: UserSubscriptionLevel;
}
