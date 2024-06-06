import { UserProfileDto } from '../dto/user-profile.dto';

export const mapUserPrivateProfile = ({
  _id,
  firstName,
  lastName,
  email,
  userActiveStatus,
  type,
  privilege,
  createdAt,
  organizationId,
}: UserProfileDto) => {
  return {
    _id,
    firstName,
    lastName,
    email,
    userActiveStatus,
    type,
    privilege,
    createdAt,
    organizationId,
  };
};
