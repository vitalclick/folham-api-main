import { IsArray, IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WidgetConfigurationDto {
  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  widgetName: string;

  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  widgetType: string;

  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  screenId: string;
}
