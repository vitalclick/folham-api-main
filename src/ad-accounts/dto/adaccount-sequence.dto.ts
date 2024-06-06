import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class AdAccountSequenceDto {
  @ApiProperty()
  @IsString()
  adAccountId: string;

  @ApiProperty()
  @IsNumber()
  order: number;
}
