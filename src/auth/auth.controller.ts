import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  Query,
  Put,
  Headers,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { SocialLoginDto } from './dto/socialLogin.dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { AuthUser } from '../common/decorators/user.decorator';
import { OTPResponseDTO } from './dto/OTPResponse.dto';
import { OTPRequestDTO } from './dto/OTPRequest.dto';
import { OTPVerificationDTO } from './dto/OTPVerification.dto';
import { PasswordResetDto } from './dto/passwordReset.dto';
import { PasswordChangeDto } from './dto/password-change.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { ActionType } from '../activity-log/types/action-type.types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private activityLogService: ActivityLogService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('login')
  async login(@AuthUser() user, @Request() req, @Body() loginDto: LoginDto) {
    const result = await this.authService.login(req.user);
    if (result) {
      const log = {
        userId: user._id,
        message: ActionType.login,
        organizationId: user.organizationId,
      };
      await this.activityLogService.saveActivityLog(log);
    }
    return result;
  }

  @ApiOkResponse({
    type: OTPResponseDTO,
  })
  @Post('login/otp')
  async verifyOTP(@Body() { email }: LoginDto) {
    return this.authService.requestOtp(email);
  }

  @HttpCode(200)
  @Post('login/social')
  async socialLogin(@Request() req, @Body() socialLoginDto: SocialLoginDto) {
    return this.authService.socialLogin(socialLoginDto);
  }

  @HttpCode(200)
  @Get('twitter/request-token')
  async requestTwitterToken(@Query('callback_url') callback_url: string) {
    return await this.authService.getTwitterRequestToken(callback_url);
  }

  @HttpCode(200)
  @Get('twitter/access-token')
  async accessTwitterToken(@Query() query) {
    return await this.authService.getTwitterAccessToken(query);
  }

  @UseGuards(RefreshAuthGuard)
  @ApiBearerAuth()
  @Post('refresh')
  async refreshToken(@AuthUser() user, @Body() body: RefreshTokenDto) {
    const { refreshToken } = body;
    const result = await this.authService.refreshToken(user, refreshToken);
    return result;
  }

  @ApiOkResponse({
    type: OTPResponseDTO,
  })
  @UseGuards(ThrottlerGuard)
  @Throttle(10, 60) // 10 requests per minute
  @Post('request-otp')
  async requestOtp(@Body() otpRequest: OTPRequestDTO) {
    return this.authService.handleOTPRequest(otpRequest);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() otpVerification: OTPVerificationDTO) {
    return this.authService.handleOTPVerification(otpVerification);
  }

  @ApiOkResponse({
    description: 'Needs previous phone verification',
    status: 201,
  })
  @Post('password-reset')
  async passwordReset(@Body() { email, password }: PasswordResetDto) {
    return this.authService.resetPassword(email, password);
  }

  @ApiOkResponse({
    description: 'Need current password to change password',
    status: 200,
  })
  @Post('change-password')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @AuthUser() user,
    @Body() { oldPassword, newPassword }: PasswordChangeDto,
  ): Promise<string> {
    const userId = user._id;
    return this.authService.changePassword(userId, oldPassword, newPassword);
  }

  @ApiOkResponse({
    description: 'Log-out successful',
    status: 200,
  })
  @Put('logout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async logout(@AuthUser() user, @Headers() headers): Promise<string> {
    const result = this.authService.logout(
      user._id,
      headers['x-device-id'],
      headers['x-bundle-id'],
    );

    if (result) {
      const log = {
        userId: user._id,
        message: ActionType.logout,
      };
      await this.activityLogService.saveActivityLog(log);
    }
    return result;
  }

  @HttpCode(200)
  @ApiOkResponse({
    description: 'Checks if a user is authenticated',
    status: 200,
  })
  @Get('is-authenticated')
  @UseGuards(JwtAuthGuard)
  async isAuthenticated() {
    return true;
  }
}
