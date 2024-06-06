import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ActivityLogDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty()
  @IsString()
  createdAt: Date;
}
