import { PartialType } from '@nestjs/swagger';
import { CreateAdScreenDto } from './create-ad-screen.dto';

export class UpdateAdScreenDto extends PartialType(CreateAdScreenDto) {}
