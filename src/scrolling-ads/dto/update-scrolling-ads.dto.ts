import { PartialType } from '@nestjs/swagger';
import { CreateContentDetailsDto } from './create-content-details.dto';

export class UpdateContentDetailsDto extends PartialType(
  CreateContentDetailsDto,
) {}
