import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReferredByDto {
  @ApiProperty()
  @IsString()
  referredBy: string;
}
