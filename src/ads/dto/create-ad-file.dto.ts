import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateAdFileDto {
  @ApiProperty()
  @IsString()
  adUrl: string;

  @ApiProperty()
  @IsString()
  adName: string;
}
