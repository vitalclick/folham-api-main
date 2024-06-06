import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UpdateUserGeneralLanguageDto } from './update-user-general-language.dto';
import { UpdateUserGeneralRegionDto } from './update-user-general-region.dto';

export class UpdateUserGeneralDto {
  @ApiPropertyOptional()
  @IsOptional()
  region: UpdateUserGeneralRegionDto;

  @ApiPropertyOptional()
  @IsOptional()
  language: UpdateUserGeneralLanguageDto;
}
