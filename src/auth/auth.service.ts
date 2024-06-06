import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { UserActiveStatus, UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import validator from 'validator';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { ConfigService } from '@nestjs/config';
// import { RedisService } from '../common/services/redis/redis.service';
import { appConstant } from '../common/constants/app.constant';
import { SocialLoginDto } from './dto/socialLogin.dto';
import { v4 as uuid } from 'uuid';
import { PhoneDetails } from '../common/types';
import { User } from '../users/schemas/user.schema';
import { OTPRequestDTO } from './dto/OTPRequest.dto';
import { OTPVerificationDTO } from './dto/OTPVerification.dto';
import { UsersRepository } from '../users/users.repository';
import { EmailService } from '../common/services/email/email.service';
import { MemcacheService } from '../common/services/memcache/memcache.service';

export enum OTPRequestType {
  login = 'login',
  signup = 'signup',
  passwordReset = 'password-reset',
  phoneChange = 'phone-change',
  accountDeletion = 'account-deletion',
}

type Email = { email: string };

export enum EmailVerificationType {
  invite = 'invite',
  user = 'user',
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
    // private redisService: RedisService,
    private usersRepository: UsersRepository,
    private emailService: EmailService,
    private memcacheService: MemcacheService,
  ) {}

  async getAxiosInstance(token, baseUrl) {
    return axios.create({
      baseURL: this.config.get(baseUrl),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getTwitterInstance() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return new Twitter({
      version: '2',
      extension: false,
      consumer_key: this.config.get('TWITTER_CONSUMER_KEY'),
      consumer_secret: this.config.get('TWITTER_CONSUMER_SECRET'),
    });
  }

  // async requestOtp(email: string) {
  //   const isEmail = validator.isEmail(email);

  //   let user: User;
  //   if (isEmail) {
  //     user = await this.usersService.getUserByEmail(email);
  //   } else {
  //     user = await this.usersService.getUserByPhoneDetails(
  //       this.getPhoneDetails(email),
  //     );
  //   }

  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }

  //   const phone = `${user.countryCode}${user.phoneNumber}`;
  //   return this.otpService.generatePhoneVerification(phone);
  // }

  // getPhoneDetails(phone: string): PhoneDetails {
  //   const pn = new PhoneNumber(phone);
  //   const countryCode = pn.getCountryCode();
  //   const phoneNumber = pn.getNumber('significant');
  //   return { countryCode: `+${countryCode}`, phoneNumber };
  // }

  async validateUser(email: string, password: string): Promise<any> {
    const isEmail = validator.isEmail(email);

    const payload = {};

    payload['email'] = email;

    const user = await this.usersService.getUserData(payload);
    if (user) {
      // Check if account was registered with social
      if (user?.hash === undefined) {
        return null;
      }
      // decrypt password
      const isMatch = await bcrypt.compare(
        password.toString(),
        user.hash.toString(),
      );
      if (isMatch) {
        return user;
      }
      return null;
    }
    return null;
  }

  async getFacebookUser(accessToken: string): Promise<any> {
    const axiosInstance = await this.getAxiosInstance(
      accessToken,
      'FACEBOOK_BASE_URL',
    );
    const response = await axiosInstance.get(
      `/me?fields=email,name,first_name,last_name`,
    );
    return response.data;
  }

  async getGoogleUser(accessToken: string): Promise<any> {
    const axiosInstance = await this.getAxiosInstance(
      accessToken,
      'GOOGLE_BASE_URL',
    );
    const response = await axiosInstance.get(`/userinfo/v2/me`);
    return response.data;
  }

  async getTwitterUser(
    oauthToken: string,
    oauthTokenSecret: string,
    twitterId: string,
  ): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const client = new Twitter({
      consumer_key: this.config.get('TWITTER_CONSUMER_KEY'),
      consumer_secret: this.config.get('TWITTER_CONSUMER_SECRET'),
      access_token_key: oauthToken,
      access_token_secret: oauthTokenSecret,
    });

    const data = await client.getBearerToken();
    const twitterAccountData = await client.get('account/verify_credentials', {
      include_email: true,
    });

    const axiosInstance = await this.getAxiosInstance(
      data.access_token,
      'TWITTER_BASE_URL',
    );
    const response = await axiosInstance.get(`/users/${twitterId}`);

    const userData = {
      email: twitterAccountData.email,
      id: response.data.data.id,
      name: response.data.data.name,
      username: response.data.data.username,
    };

    return userData;
  }

  async getAppleUser(accessToken: string): Promise<any> {
    // Decrypt JWT token from apple
    const decodedData = jwt_decode<any>(accessToken);
    const { iss, sub, email } = decodedData;
    if (iss !== 'https://appleid.apple.com') {
      throw new ForbiddenException();
    }
    return {
      id: sub,
      email,
    };
  }

  async login(user: any) {
    const payload = {
      sub: user._id,
      email: user.email,
      username: user.username,
      general: user.general || {},
    };

    // Make refresh token
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: appConstant.TOKENS.REFRESH.JWT_DURATION,
    });
    // Store refresh token in redis with expire time
    await this.memcacheService.set(
      refreshToken,
      refreshToken,
      appConstant.TOKENS.REFRESH.REDIS_DURATION,
    );

    if (user.userActiveStatus === UserActiveStatus.deactivated) {
      // update the userActiveStatus of the user
      await this.usersRepository.findByIdAndUpdate(
        user._id,
        {
          userActiveStatus: 0,
        },
        {
          new: true,
        },
      );
    }

    return {
      access_token: this.jwtService.sign(payload),
      refreshToken,
    };
  }

  async getTwitterRequestToken(callback_url: string) {
    const twitter = await this.getTwitterInstance();

    return twitter
      .getRequestToken(callback_url)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        return error;
      });
  }

  async getTwitterAccessToken(query: any) {
    const twitter = await this.getTwitterInstance();

    const options = {
      oauth_token: query.oauth_token,
      oauth_verifier: query.oauth_verifier,
    };
    return twitter
      .getAccessToken(options)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        return error.message;
      });
  }

  async refreshToken(user, token) {
    const refreshToken = await this.memcacheService.get(token);
    if (!refreshToken) {
      throw new BadRequestException('Invalid refresh token');
    }
    const decoded = this.jwtService.decode(refreshToken);

    if (decoded.sub !== user._id) {
      await this.memcacheService.delete(refreshToken);
      throw new UnauthorizedException();
    }
    await this.memcacheService.delete(refreshToken);
    return this.login(user);
  }

  async socialLogin(socialLoginDto: SocialLoginDto) {
    const {
      accessToken,
      socialLoginType,
      socialId,
      oauthToken,
      oauthTokenSecret,
      extraData,
    } = socialLoginDto;
    let user;
    const userData = {};
    let email: string;
    let username: string;
    let countryCode: string;
    let phoneNumber: string;
    // Validate accesstoken and get user data
    switch (socialLoginType) {
      case 'facebook':
        userData['facebookSocialLogin'] = {
          id: socialId,
          type: socialLoginType,
          accessToken,
        };
        user = await this.getFacebookUser(accessToken);
        break;
      case 'google':
        userData['googleSocialLogin'] = {
          id: socialId,
          type: socialLoginType,
          accessToken,
        };
        user = await this.getGoogleUser(accessToken);
        break;
      case 'twitter':
        userData['twitterSocialLogin'] = {
          id: socialId,
          type: socialLoginType,
          accessToken,
        };
        user = await this.getTwitterUser(
          oauthToken,
          oauthTokenSecret,
          socialId,
        );
        break;
      case 'apple':
        userData['appleSocialLogin'] = {
          id: socialId,
          type: socialLoginType,
          accessToken,
        };
        user = await this.getAppleUser(accessToken);
        break;
      default:
        throw new NotFoundException('Invalid social login type');
    }

    if (!user) {
      throw new NotFoundException('Invalid user token');
    }

    // TODO: Check for email or phone number to proceed
    if (!(user.email || user.phone)) {
      throw new NotFoundException('Invalid token scope');
    }
    if (user.email) {
      email = user.email;
      // Generate unique username
      username = `${email.substring(0, email.indexOf('@'))}-${Date.now()}`;
    }

    const firstName =
      user?.first_name || user?.given_name || extraData?.firstName;
    const lastName =
      user?.last_name || user?.family_name || extraData?.lastName;

    // return tokens
    const existingUser: any = await this.usersService.getUserByEmail(email);
    if (existingUser) {
      const loginPayload = {
        _id: existingUser._id,
        email,
        firstName,
        lastName,
      };
      if (existingUser.userActiveStatus === UserActiveStatus.deactivated) {
        // update the userActiveStatus of the user
        await this.usersRepository.findByIdAndUpdate(
          existingUser._id,
          {
            userActiveStatus: 0,
          },
          {
            new: true,
          },
        );
      }
      return this.login(loginPayload);
    }
    return {
      data: { firstName, lastName, email },
    };
  }

  getEmailVerification(
    type: EmailVerificationType,
    email: string,
  ): { code: string; link: string } {
    const code = uuid();
    const link = `${
      process.env.WEBSITE_URL
    }email-confirmation/${encodeURIComponent(email)}/${code}`;
    return { code, link };
  }

  async handleOTPRequest({ email, type }: OTPRequestDTO) {
    if (type === OTPRequestType.signup) {
      //  check if email exists and Check if there is already a user with this phone number, as it needs to be unique.
      const user = await this.usersService.getUserByEmail(email);
      if (user) {
        throw new BadRequestException(
          'There is already a user with that Email address',
        );
      }

      return this.emailService.generateEmailOTPVerification(email);
    }
    // } else if (type === OTPRequestType.passwordReset) {
    //   let user: undefined | User;
    //   if (phone) {
    //     user = await this.usersService.getUserByPhoneDetails(
    //       this.getPhoneDetails(phone),
    //     );
    //   } else if (email) {
    //     user = await this.usersService.getUserByEmail(email);

    //     return this.emailService.generateEmailOTPVerification(
    //       user.email,
    //       user.firstName,
    //     );
    //   }
    //   if (!user) {
    //     throw new BadRequestException(
    //       'We could not find a user with the given credentials',
    //     );
    //   }
    //   return this.otpService.generatePhoneVerification(
    //     this.getPhoneNumberFromUser(user),
    //   );
    // } else if (type === OTPRequestType.accountDeletion) {
    //   let user: undefined | User;
    //   if (phone) {
    //     user = await this.usersService.getUserByPhoneDetails(
    //       this.getPhoneDetails(phone),
    //     );
    //   }
    //   if (!user) {
    //     throw new BadRequestException(
    //       'We could not find a user with the given credentials',
    //     );
    //   }
    //   return this.otpService.generatePhoneVerification(
    //     this.getPhoneNumberFromUser(user),
    //   );
    // } else if (type === OTPRequestType.phoneChange) {
    //   let user: undefined | User;
    //   if (phone) {
    //     user = await this.usersService.getUserByPhoneDetails(
    //       this.getPhoneDetails(phone),
    //     );
    //   }
    //   if (user) {
    //     throw new BadRequestException(
    //       'There is already a user with that phone number',
    //     );
    //   }
    //   return this.otpService.generatePhoneVerification(phone);
    // }
  }

  async handleOTPVerification({ code, email }: OTPVerificationDTO) {
    return this.emailService.verifyEmail(email, code);
  }

  async resetPassword(email: string, password: string) {
    const user = (await this.usersService.getUserByEmail(email)) as User & {
      _id: string;
    };

    if (!user) {
      throw new NotFoundException('No user with those credentials');
    }

    const { salt, hash } = await this.saltPassword(password);

    await this.usersService.changePassword(user._id as string, hash, salt);

    return;
  }

  getEmail(email: string): Email {
    const isEmail = validator.isEmail(email);
    return { email: email };
  }

  async saltPassword(
    password: string,
  ): Promise<{ salt: string; hash: string }> {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);
    return { salt, hash };
  }

  async changePassword(
    userId,
    oldPassword: string,
    password: string,
  ): Promise<string> {
    const user: any = await this.usersService.getUserData({ _id: userId });
    if (!user) {
      throw new ForbiddenException('You are not allowed to change password');
    }

    const isMatch = await bcrypt.compare(
      oldPassword.toString(),
      user.hash.toString(),
    );
    if (!isMatch) {
      throw new BadRequestException('Invalid password');
    }
    const { salt, hash } = await this.saltPassword(password);

    await this.usersService.changePassword(userId as string, hash, salt);
    return 'Password changed!';
  }

  async logout(userId, deviceId, bundleId): Promise<string> {
    const user: User = await this.usersService.getUserData({ _id: userId });
    if (!user) throw new ForbiddenException('User not found');

    return 'Logout successfully';
  }

  async requestOtp(email: string) {
    const isEmail = validator.isEmail(email);
    const user = await this.usersService.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // return this.otpService.generatePhoneVerification(isEmail);
  }
}
