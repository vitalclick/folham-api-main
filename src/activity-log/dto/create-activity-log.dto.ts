import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateActivityLogDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  message?: string;
}
