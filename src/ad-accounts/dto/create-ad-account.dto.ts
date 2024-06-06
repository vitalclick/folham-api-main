import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDefined, IsOptional, IsString } from 'class-validator';

export class CreateAdAccountDto {
  @ApiProperty()
  @IsString()
  @IsDefined()
  name: string;

  @ApiProperty()
  @IsString()
  @IsDefined()
  adCompany: string;

  @ApiProperty()
  @IsString()
  @IsDefined()
  adScreen: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organizationId?: string;
}
