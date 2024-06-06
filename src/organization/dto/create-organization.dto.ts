import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty()
  @IsString()
  name: string;
}
