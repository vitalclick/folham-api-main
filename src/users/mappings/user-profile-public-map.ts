import { UserProfilePublicDto } from '../dto/user-profile-public.dto';

export const mapUserPublicProfile = ({
  _id,
  firstName,
  lastName,
  email,
  type,
}: UserProfilePublicDto) => {
  return {
    _id,
    firstName,
    lastName,
    email,
    type,
  };
};
