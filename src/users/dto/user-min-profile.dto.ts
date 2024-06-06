import { ApiProperty } from '@nestjs/swagger';
import { UpdateSocialNetworkDto } from './update-social-network.dto';

export class UserMinProfileDto {
  @ApiProperty()
  _id?: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  profilePic: string;

  @ApiProperty()
  socialNetworks?: UpdateSocialNetworkDto[];
}
