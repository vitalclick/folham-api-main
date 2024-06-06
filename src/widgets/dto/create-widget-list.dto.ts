import { IsDefined, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWidgetListDto {
  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  image: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  api?: string;
}
