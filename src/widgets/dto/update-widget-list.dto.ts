import { PartialType } from '@nestjs/swagger';
import { CreateWidgetListDto } from './create-widget-list.dto';

export class UpdateWidgetListDto extends PartialType(CreateWidgetListDto) {}
