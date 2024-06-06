import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LongAndLatDto {
  @ApiProperty()
  @IsString()
  city: string;
}
