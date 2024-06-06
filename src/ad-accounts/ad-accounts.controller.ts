import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpStatus,
  UseGuards,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../common/decorators/user.decorator';
import { AdAccountsService } from './ad-accounts.service';
import { AdAccountsDto } from './dto/ad-account.dto';
import { AdCompanyAccountsAndCampaignsDto } from './dto/ad-company-account-campaign.dto';
import { AdCompanyDto } from './dto/ad-company.dto';
import { AdAccountSequenceDto } from './dto/adaccount-sequence.dto';
import { CreateAdAccountDto } from './dto/create-ad-account.dto';
import { CreateAdCompanyDto } from './dto/create-ad-company.dto';
import { UpdateAdAccountDto } from './dto/update-ad-account.dto';
import { UpdateAdCompanyDto } from './dto/update-ad-company.dto';
import { UserAuthInfo } from '../users/interface/user.interface';
import { User } from '../users/schemas/user.schema';

@ApiTags('ad-accounts')
@Controller()
export class AdAccountController {
  constructor(private readonly adAccountsService: AdAccountsService) {}

  @Post('ad-accounts/create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Creates a new ad account',
    type: AdAccountsDto,
  })
  async create(
    @AuthUser() user: UserAuthInfo,
    @Body() adAccountData: CreateAdAccountDto,
  ) {
    return this.adAccountsService.create(adAccountData, user);
  }

  @Get('ad-accounts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns all available ad accounts',
    type: [AdAccountsDto],
  })
  findAll(@AuthUser() user: UserAuthInfo) {
    return this.adAccountsService.findAll(user);
  }

  @Get('ad-accounts/get-campaign/:adAccountId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns all available ad accounts',
    type: [AdAccountsDto],
  })
  findAdAccountCampaigns(
    @AuthUser() user: UserAuthInfo,
    @Param('adAccountId') id: string,
  ) {
    return this.adAccountsService.findCampaignByAdAccounts(id, user);
  }

  @Put('ad-accounts/:id/update')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Updates an existing ad-account with the newly sent fields',
    type: AdAccountsDto,
  })
  async update(
    @AuthUser() user,
    @Param('id') id: string,
    @Body() data: UpdateAdAccountDto,
  ) {
    await this.adAccountsService.update(id, data, user);
    return {
      statusCode: HttpStatus.OK,
      message: 'AdAccount updated successfully',
    };
  }

  @Get('ad-accounts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns a single Ad account',
    type: AdAccountsDto,
  })
  findOne(@AuthUser() user, @Param('id') id: string) {
    return this.adAccountsService.findOneById(id, user);
  }

  @Delete('ad-accounts/:id/delete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Deletes an existing Ad account',
  })
  async delete(
    @AuthUser() user: UserAuthInfo,
    @Param('id') id: string,
  ): Promise<any> {
    const loggedUser = new User(user as unknown as User);
    if (loggedUser.isAdmin() || loggedUser.isSuperAdmin()) {
      await this.adAccountsService.delete(id, user);
      return {
        statusCode: HttpStatus.OK,
        message: 'adAccount deleted successfully',
      };
    }

    const adAccount = await this.adAccountsService.findOneById(id, user);
    if (!adAccount) {
      throw new NotFoundException('The adAccount specified does not exist');
    }

    if (loggedUser.isOrganizationOwner(adAccount.organizationId)) {
      await this.adAccountsService.delete(id, user);
      return {
        statusCode: HttpStatus.OK,
        message: 'adAccount deleted successfully',
      };
    }

    throw new UnauthorizedException(
      'You are not authorized to delete this adAccount',
    );
  }

  @Get('ad-accounts/screen/:screenId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns a screen Ad account Schedule',
    type: AdAccountsDto,
  })
  findScreenSchedule(@AuthUser() user, @Param('screenId') screenId: string) {
    // return this.adAccountsService.findAdaccountScheduleByScreen(screenId, user);
    return this.adAccountsService.findAdaccountScheduleByScreenWithViewPort(
      screenId,
      user,
    );
  }

  @Put('ad-accounts/update-sequence-order')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: [AdAccountSequenceDto] })
  @ApiOkResponse({
    description:
      'Updates an existing Campaign sequence order with the new order numbers sent in the request',
    type: [AdAccountsDto],
  })
  async updateAdaccountSequenceOrder(
    @AuthUser() user: UserAuthInfo,
    @Body() data: AdAccountSequenceDto[],
  ) {
    const loggedUser = new User(user as unknown as User);
    if (loggedUser.isAdmin() || loggedUser.isSuperAdmin()) {
      const order = await this.adAccountsService.updateScheduleSequence(data);
      return order;
    }
    throw new UnauthorizedException(
      'You are not authorized to update this ad account sequence order',
    );
  }

  @Get('all-adaccounts/:screenId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns all ad  accounts on a screen',
    type: AdCompanyAccountsAndCampaignsDto,
  })
  findOnlyAdaccounts(@Param('screenId') screenId: string) {
    return this.adAccountsService.returnOnlyAdaccountsRelatedToScreen(screenId);
  }

  @Post('ad-company/create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Creates a new ad company',
    type: AdCompanyDto,
  })
  async createAdCompany(
    @AuthUser() user,
    @Body() adAccountData: CreateAdCompanyDto,
  ) {
    return this.adAccountsService.createAdCompany(adAccountData, user);
  }

  @Get('ad-company/:filter')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns all available ad companies based on the filter',
    type: [AdCompanyDto],
  })
  findAllAdCompany(
    @AuthUser() user: UserAuthInfo,
    @Param('filter') filter: string,
  ) {
    return this.adAccountsService.findAllAdCompany(
      user,
      filter == 'true' ? true : false,
    );
  }

  @Put('ad-company/:id/update')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Updates an existing ad-company with the newly sent fields',
    type: AdCompanyDto,
  })
  async updateAdCompany(
    @AuthUser() user: UserAuthInfo,
    @Param('id') id: string,
    @Body() data: UpdateAdCompanyDto,
  ) {
    await this.adAccountsService.updateAdCompany(id, data, user);
    return {
      statusCode: HttpStatus.OK,
      message: 'Ad Company updated successfully',
    };
  }

  @Get('get-ad-company/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns a single ad company',
    type: AdCompanyAccountsAndCampaignsDto,
  })
  findOneAdCompany(@AuthUser() user, @Param('id') id: string) {
    return this.adAccountsService.findOneAdCompanyById(id, user);
  }

  @Delete('ad-company/:id/delete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Deletes an existing ad company',
  })
  async deleteAdCompany(
    @AuthUser() user: UserAuthInfo,
    @Param('id') id: string,
  ): Promise<any> {
    return this.adAccountsService.deleteAdCoompany(id, user);
  }
}
