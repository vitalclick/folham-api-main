import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';
import { CompanyActiveStatus } from '../schema/ad-company.schema';
import { CreateAdCompanyDto } from './create-ad-company.dto';

export class UpdateAdCompanyDto extends PartialType(CreateAdCompanyDto) {
  @ApiProperty()
  @IsEnum(CompanyActiveStatus)
  @IsNumber()
  companyActiveStatus?: CompanyActiveStatus;
}
