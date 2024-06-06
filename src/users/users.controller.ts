import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  HttpStatus,
  UseGuards,
  Put,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { query, Response } from 'express';
import { UserActiveStatus, UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UpdateUserLocaleDto } from './dto/update-user-locale.dto';
import { AuthUser } from '../common/decorators/user.decorator';
import { User } from './schemas/user.schema';
import { UserProfileDto } from './dto/user-profile.dto';
import { CheckAvailableUserParamsDTO } from './dto/check-available-user-params.dto';
import { UpdateUserProfileUsernameDto } from './dto/update-user-profile-username.dto';
import { UserProfilePublicDto } from './dto/user-profile-public.dto';
import { appConstant } from '../common/constants/app.constant';
import { DeleteUserDto } from './dto/delete-user.dto';
import { PagingOptions } from '../activity-log/types/paging-options.types';
import { UpdateUserPrivilegeDto } from './dto/update-user-admin-access.dto';
import {
  AddUserToOrganizationDto,
  UpdateUserProfileDto,
} from './dto/update-user-profile.dto';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { ActionType } from '../activity-log/types/action-type.types';
import { AdminAccess } from './types/users.types';
import { UserAuthInfo } from './interface/user.interface';

@ApiTags('users')
@Controller()
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private activityLogService: ActivityLogService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns other user profile',
    type: UserProfileDto,
  })
  @Get('user/:username')
  async getUsername(@Param('username') username: string): Promise<any> {
    return await this.usersService.getUserByUsername(username);
  }

  @Post('user')
  async signUp(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
  ): Promise<any> {
    const { email, password, firstName, lastName, username, organizationId } =
      createUserDto;

    const user = await this.usersService.getUserByEmail(email);
    if (user) {
      return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        message: 'Account already exists',
      });
    }

    // Check if username exist
    if (username) {
      const user = await this.usersService.getUserByUsername(username);
      if (user) {
        return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
          message: 'Username already exists',
        });
      }
    }

    const { salt, hash } = await this.authService.saltPassword(password);
    // Verify password policy
    // Atleast one uppercase character, atleast one lowercase character, at least one number, at least one special character and minimum 8 character
    // Regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!"#$%&'()+,-.:;<=>?@[\]^_`{|}~*])(?=.{8,})
    const regularExpression = appConstant.REGEX.PASSWORD;

    if (!regularExpression.test(password)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message:
          'Invalid password format, password should contain atleast one uppercase character, atleast one lowercase character, at least one number, at least one special character and minimum 8 character',
      });
    }

    const userData = {
      email,
      salt,
      hash,
      username,
      firstName,
      lastName,
      organizationId,
    };

    const createdUser = (await this.usersService.create(userData)) as any;
    if (createdUser) {
      const log = {
        userId: createdUser._id,
        message: createdUser.username + ActionType.signUp,
      };
      await this.activityLogService.saveActivityLog(log);
    }

    // TODO: Send welcome email and email verification link
    const loginPayload = {
      _id: createdUser._id,
      email,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
    };

    return res
      .status(HttpStatus.CREATED)
      .send(await this.authService.login(loginPayload));
  }

  @Get('all-users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'returns all users',
    type: [UserProfileDto],
  })
  async getAllUsers(@AuthUser() user, @Query() pagination: PagingOptions) {
    return this.usersService.getUsers(pagination, user);
  }

  @Put('users/locale')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Get user profile with locale after update',
    type: UserProfileDto,
  })
  async updateUser(
    @AuthUser() user,
    @Body() updateUserLocaleDto: UpdateUserLocaleDto,
  ): Promise<User> {
    const result = this.usersService.updateUserData(
      user._id,
      updateUserLocaleDto,
    );
    if (result) {
      const log = {
        userId: user._id,
        message: user.username + ActionType.update_locale_data,
      };
      await this.activityLogService.saveActivityLog(log);
    }
    return result;
  }

  @Put('users/privilege/:accountId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Updates the privilege a user has',
    type: UserProfileDto,
  })
  async updateUserAdminAccess(
    @AuthUser() user: UserAuthInfo,
    @Param('accountId') accountId: string,
    @Body() updateUserPrivilegeDto: UpdateUserPrivilegeDto,
  ): Promise<User> {
    const loggedUser = new User(user as unknown as User);
    if (
      user._id == accountId ||
      (!loggedUser.isAdmin() && !loggedUser.isSuperAdmin())
    ) {
      throw new UnauthorizedException('You cannot perform action');
    }
    const result = await this.usersService.updateUserPrivilege(
      accountId,
      updateUserPrivilegeDto,
    );
    if (result) {
      const log = {
        userId: user._id,
        message:
          user.username +
          ' ' +
          ActionType.update_user_privilege +
          result.firstName +
          ' ' +
          result.lastName +
          ' to ' +
          result.privilege,
      };
      await this.activityLogService.saveActivityLog(log);
    }
    return result;
  }

  @Put('user/admin-update')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Allows only admin to update a user data',
    type: UserProfileDto,
  })
  async updateUserByAdmin(
    @AuthUser() user,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<User> {
    const result = this.usersService.updateUser(user._id, updateUserProfileDto);
    if (result) {
      const log = {
        userId: user._id,
        message: user.username + ActionType.update_user,
      };
      await this.activityLogService.saveActivityLog(log);
    }
    return result;
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Get own profile of a user',
    type: UserProfileDto,
  })
  async getProfile(@AuthUser() user): Promise<any> {
    const userId = user._id;
    return this.usersService.getUserById(userId);
  }

  @Get('profile/:username')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Get public profile of a user',
    type: UserProfilePublicDto,
  })
  async getProfileByUsername(
    @Param('username') username: string,
  ): Promise<any> {
    return this.usersService.getUserByUsername(username);
  }

  @Get('users/exist')
  @ApiOkResponse({
    description:
      'Check whether the given username, email or phone number is already exist. Pass only one param at a time',
    type: Boolean,
  })
  async isExist(
    @Query() params: CheckAvailableUserParamsDTO,
  ): Promise<boolean | User> {
    return this.usersService.isExist(params);
  }

  @Put('profile/username')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Updates the username and returns the updated profile',
    type: UserProfileDto,
  })
  async updateProfileUsername(
    @AuthUser() user,
    @Body() updateUserProfileUsernameDto: UpdateUserProfileUsernameDto,
  ): Promise<User> {
    const result = this.usersService.updateProfileUsername(
      user._id,
      updateUserProfileUsernameDto,
    );
    if (result) {
      const log = {
        userId: user._id,
        message:
          user.username +
          ActionType.update_username +
          ' to ' +
          updateUserProfileUsernameDto.username,
      };
      await this.activityLogService.saveActivityLog(log);
    }
    return result;
  }

  @Post('account/activate/:accountId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description:
      'Allows an admin to Toggle activate / deactivate a user account',
  })
  async activateUserAccount(
    @AuthUser() user: UserAuthInfo,
    @Param('accountId') accountId: string,
  ) {
    const loggedUser = new User(user as unknown as User);
    if (user._id == accountId || !loggedUser.isAdmin()) {
      throw new UnauthorizedException('You cannot perform action');
    }
    const result = await this.usersService.activateAccount(accountId);
    if (result) {
      const status =
        Number(result.userActiveStatus) == 0
          ? ActionType.activate_account
          : ActionType.deactivate_account;
      const log = {
        userId: user._id,
        message:
          user.username +
          ' ' +
          status +
          ' for ' +
          result.firstName +
          ' ' +
          result.lastName,
      };
      await this.activityLogService.saveActivityLog(log);
    }
    return result;
  }

  @Put('organization/add-user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Adds a user to an organization',
    type: UserProfileDto,
  })
  async addUserToOrganization(
    @AuthUser() user: UserAuthInfo,
    @Body() updateUserProfileDto: AddUserToOrganizationDto,
  ) {
    const loggedUser = new User(user as unknown as User);
    if (!loggedUser.isAdmin() && !loggedUser.isSuperAdmin()) {
      throw new UnauthorizedException('You cannot perform action');
    }
    const result = this.usersService.updateUser(updateUserProfileDto.userId, {
      organizationId: updateUserProfileDto.organizationId,
    });
    if (result) {
      const log = {
        userId: user._id,
        message: user.username + ActionType.add_user_to_organization,
      };
      await this.activityLogService.saveActivityLog(log);
    }
    return result;
  }
}
