import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchQuery {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  query?: string;
}
