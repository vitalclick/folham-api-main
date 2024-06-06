import { IsArray, IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserGeneralRegionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  regions: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  myLocation: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  deviceSettings: boolean;
}
