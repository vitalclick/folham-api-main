import { PartialType } from '@nestjs/swagger';
import { CreateAdAccountDto } from './create-ad-account.dto';

export class UpdateAdAccountDto extends PartialType(CreateAdAccountDto) {}
