import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddNewWidgetDto {
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
