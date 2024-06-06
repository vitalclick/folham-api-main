import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class FilterScrollingAdsQueryDTO {
  @ApiProperty()
  @IsBoolean()
  isActive? = true;

  @ApiProperty()
  @IsBoolean()
  expired? = true;
}
