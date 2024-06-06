import { IsArray, IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserGeneralLanguageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  languages: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  deviceSettings: boolean;
}
