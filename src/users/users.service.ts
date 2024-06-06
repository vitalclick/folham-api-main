import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './schemas/user.schema';
import { UserProfileDto } from './dto/user-profile.dto';
import { UsersRepository } from './users.repository';
import { UpdateUserLocaleDto } from './dto/update-user-locale.dto';
import { mapUserPrivateProfile } from './mappings/user-profile-map';
import { CheckAvailableUserParamsDTO } from './dto/check-available-user-params.dto';
import { UpdateUserProfileUsernameDto } from './dto/update-user-profile-username.dto';
import { UpdateUserProfileEmailAddressDto } from './dto/update-user-profile-email-address.dto';
import { UserProfilePublicDto } from './dto/user-profile-public.dto';
import {
  AdminAccess,
  UserSubscriptionLevel,
  UserType,
} from './types/users.types';
import { UpdateUserSubscriptionLevelDto } from './dto/update-user-subscription-level.dto';
import { UpdateUserPrivilegeDto } from './dto/update-user-admin-access.dto';
import { PagingOptions } from '../activity-log/types/paging-options.types';
import { Types } from 'mongoose';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UserAuthInfo } from './interface/user.interface';

export enum UserActiveStatus {
  activated = 0,
  deactivated = 1,
  deleted = 2,
}

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async getUsers(
    pagination: PagingOptions,
    user: UserAuthInfo,
  ): Promise<User[]> {
    if (user.privilege === AdminAccess.admin) {
      const query = { organizationId: new Types.ObjectId(user.organizationId) };
      return this.usersRepository.find(query, pagination);
    }
    if (user.privilege === AdminAccess.superAdmin) {
      return this.usersRepository.find({}, pagination);
    }
    throw new ForbiddenException(
      'You do not have permission to view all users',
    );
  }

  async create(payload): Promise<User> {
    const newUser = new User();
    Object.assign(newUser, payload);
    newUser.organizationId = new Types.ObjectId(payload.organizationId);
    return this.usersRepository.create(newUser);
  }

  async getUserById(userId: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({
      _id: new Types.ObjectId(userId),
    });

    return user;
  }

  async getUserByUsername(
    username: string,
  ): Promise<UserProfilePublicDto | undefined> {
    const user = await this.usersRepository.findOne({
      username,
    });

    if (
      user &&
      user.userActiveStatus &&
      (user.userActiveStatus === 1 || user.userActiveStatus === 2)
    ) {
      return;
    }

    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (email !== undefined) {
      return this.usersRepository.findOne({ email });
    }
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserProfileDto,
  ): Promise<User> {
    const userInfo = await this.usersRepository.findById(userId);
    if (userInfo._id === undefined) {
      throw new ForbiddenException('You are not allowed to update');
    }
    if (userInfo.isAdmin() || userInfo.isSuperAdmin()) {
      return this.usersRepository.findByIdAndUpdate(
        new Types.ObjectId(userId),
        updateUserDto,
      );
    }
  }

  async updateUserData(
    userId,
    updateUserLocaleDto: UpdateUserLocaleDto,
  ): Promise<User> {
    const userInfo = await this.usersRepository.findById(userId);

    if (!userInfo) {
      throw new ForbiddenException('You are not allowed to update');
    }

    const user = await this.usersRepository.findByIdAndUpdate(
      userId,
      userInfo,
      {
        new: true,
      },
    );

    return user;
  }

  async isExist(data: CheckAvailableUserParamsDTO): Promise<boolean | User> {
    // changed the promise to return boolean
    const { email, username } = data;

    if (!username && !email) {
      throw new BadRequestException('missing params');
    }
    const query = username ? { username } : { email };
    const result = await this.usersRepository.findOne(query);

    return result ? true : false;
  }

  async updateProfileUsername(
    userId,
    updateUserProfileUsernameDto: UpdateUserProfileUsernameDto,
  ): Promise<User | undefined> {
    const { username } = updateUserProfileUsernameDto;

    const userInfo: any = await this.usersRepository.findById(userId);

    if (userInfo._id === undefined) {
      throw new ForbiddenException('You are not allowed to update');
    }
    // check if username used
    const usernameInfo: any = await this.usersRepository.findOne({ username });
    if (usernameInfo?._id !== undefined && userInfo?.username !== username) {
      throw new ForbiddenException('Username already exists');
    }

    const updateObject = Object.assign(userInfo, updateUserProfileUsernameDto);

    const user = await this.usersRepository.findByIdAndUpdate(
      userId,
      updateObject,
      { new: true },
    );
    return user;
  }

  async updateProfileEmailAddress(
    userId,
    updateUserProfileEmailAddressDto: UpdateUserProfileEmailAddressDto,
  ): Promise<User | undefined> {
    const { email } = updateUserProfileEmailAddressDto;

    const userInfo: any = await this.usersRepository.findById(userId);

    if (!userInfo) {
      throw new ForbiddenException('You are not allowed to update');
    }
    // check if email used
    const useremailInfo: any = await this.usersRepository.findOne({ email });
    if (!useremailInfo && userInfo?.email !== email) {
      throw new ForbiddenException('Email already exists');
    }

    const updateObject = Object.assign(
      userInfo,
      updateUserProfileEmailAddressDto,
    );

    const user = await this.usersRepository.findByIdAndUpdate(
      userId,
      updateObject,
      { new: true },
    );
    return user || null;
  }

  async updateProfileSubscriptionLevel(
    userId: string,
    updateUserSubscriptionLevelDto: UpdateUserSubscriptionLevelDto,
  ): Promise<User | undefined> {
    let userSubscriptionLevel;
    if (
      updateUserSubscriptionLevelDto.userSubscriptionLevel ===
      UserSubscriptionLevel.free
    ) {
      userSubscriptionLevel = 0;
    } else if (
      updateUserSubscriptionLevelDto.userSubscriptionLevel ===
      UserSubscriptionLevel.pro
    ) {
      userSubscriptionLevel = 1;
    }

    const userInfo: any = await this.usersRepository.findById(userId);

    if (!userInfo) {
      throw new ForbiddenException('You are not allowed to update');
    }
    const updateObject = Object.assign(userInfo, { userSubscriptionLevel });

    const user = await this.usersRepository.findByIdAndUpdate(
      userId,
      updateObject,
      { new: true },
    );
    return user || null;
  }

  public async changePassword(
    userId: string,
    hash: string,
    salt: string,
  ): Promise<User> {
    return await this.usersRepository.findByIdAndUpdate(userId, {
      hash,
      salt,
    });
  }

  // async deactivateAccount(userId) {
  //   try {
  //     const userActiveStatus = UserActiveStatus.deactivated;
  //     const result = await this.usersRepository.findByIdAndUpdate(
  //       userId,
  //       {
  //         userActiveStatus,
  //       },
  //       {
  //         new: true,
  //       },
  //     );
  //     if (result) {
  //       return result;
  //     } else {
  //       throw new BadRequestException('Already Deactivated');
  //     }
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async activateAccount(accountId: string) {
    const accountUser = await this.usersRepository.findById(accountId);
    if (!accountUser) {
      throw new NotFoundException('Invalid User Selected');
    }
    const userActiveStatus =
      accountUser.userActiveStatus == UserActiveStatus.activated
        ? UserActiveStatus.deactivated
        : UserActiveStatus.activated;

    return this.usersRepository.findByIdAndUpdate(
      accountId,
      {
        userActiveStatus: userActiveStatus,
      },
      {
        new: true,
      },
    );
  }

  // async deleteAccount(userId, deleteUserDto): Promise<User | undefined> {
  //   try {
  //     const { reason } = deleteUserDto;

  //     const deleteObject = {
  //       tags: null,
  //       firstName: 'Deleted',
  //       lastName: 'User',
  //       email: null,
  //       salt: null,
  //       hash: null,
  //       username: uuid(),
  //       countryCode: null,
  //       phoneNumber: null,
  //       userActiveStatus: UserActiveStatus.deleted,
  //       userTitles: null,
  //       appleSocialLogin: null,
  //       twitterSocialLogin: null,
  //       googleSocialLogin: null,
  //       facebookSocialLogin: null,
  //       reason,
  //     };

  //     const userObject = await this.usersRepository.findById(userId);

  //     const result = await this.usersRepository.findByIdAndUpdate(
  //       userId,
  //       deleteObject,
  //       {
  //         new: true,
  //       },
  //     );
  //     if (result?.userActiveStatus === UserActiveStatus.deleted) {
  //       throw new BadRequestException('Already Deleted');
  //     }
  //     return result;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async updateUserAccountType(userId, type: UserType): Promise<User> {
    return this.usersRepository.findByIdAndUpdate(userId, { type });
  }

  async updateUserPrivilege(
    accountId: string,
    updateUserPrivilegeDto: UpdateUserPrivilegeDto,
  ): Promise<User | undefined> {
    const userInfo = await this.usersRepository.findOne({
      _id: new Types.ObjectId(accountId),
    });
    if (!userInfo) {
      throw new NotFoundException('User not Found');
    }
    const user = await this.usersRepository.findByIdAndUpdate(
      userInfo._id,
      { privilege: updateUserPrivilegeDto.privilege },
      { new: true },
    );
    return user || null;
  }

  async getUserData(payload: any): Promise<User | undefined> {
    return this.usersRepository.getUserData(payload);
  }

  async getOrganizationUsers(organizationId: string) {
    return this.usersRepository.getOrganizationUsers(organizationId);
  }

  async getAllSuperAdminEmails() {
    return this.usersRepository.getAllSuperAdminEmails();
  }

  async getAllAdminEmailsInOrganization(organizationId: Types.ObjectId) {
    return this.usersRepository.getAllAdminEmailsInOrganization(organizationId);
  }
}
