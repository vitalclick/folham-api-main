import { PartialType } from '@nestjs/swagger';
import { CreateScrollingAdsDto } from './create-scrolling-ads';

export class UpdateScrollingAdsDto extends PartialType(CreateScrollingAdsDto) {}
