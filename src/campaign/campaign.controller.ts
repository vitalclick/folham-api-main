import {
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../common/decorators/user.decorator';
import { CampaignService } from './campaign.service';
import { CampaignSequenceDto } from './dto/campaign-sequence.dto';
import { CampaignDto } from './dto/campaign.dto';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { AdScreensService } from '../ad-screens/ad-screens.service';
// import { EventsGateway } from '../common/events/events.gateway';
import { PublicAdvertsService } from '../public-adverts/public-adverts.service';
import { AdvertUpdateService } from '../queues/advert-update.service';
import { UserAuthInfo } from '../users/interface/user.interface';
import { EventsGateway } from '../queues/event-gateway/events.gateway';

@ApiTags('campaigns')
@Controller('campaign')
export class CampaignController {
  constructor(
    private readonly campaignService: CampaignService,
    @Inject(forwardRef(() => PublicAdvertsService))
    private readonly publicAdvertsService: PublicAdvertsService,
    private readonly adScreensService: AdScreensService,
    private eventsGateway: EventsGateway,
    private advertUpdateService: AdvertUpdateService,
  ) {}

  @Post('campaigns/create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Creates a new campaign',
    type: CampaignDto,
  })
  async create(@AuthUser() user, @Body() data: CreateCampaignDto) {
    const userId = user._id;
    const campaign = await this.campaignService.create(data, user);

    // Check if adscreenId is defined before proceeding
    if (campaign && campaign.adScreen) {
      const adscreenId = await this.adScreensService.findOneById(
        campaign.adScreen.toHexString(),
        user,
      );

      if (!adscreenId) {
        throw new NotFoundException('The ad screen specified does not exist');
      }

      const publicAdvert =
        await this.publicAdvertsService.displayAdAndConfiguration(
          adscreenId.adScreenDetails.deviceId,
        );

      await this.advertUpdateService.addToQueue(publicAdvert);
    }
    return campaign;
  }

  @Get('campaigns')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns all available campaigns',
    type: [CampaignDto],
  })
  findAll(@AuthUser() user) {
    return this.campaignService.findAll(user);
  }

  @Put('campaigns/:id/update')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Updates an existing Campaign with the newly sent fields',
    type: CampaignDto,
  })
  async update(
    @AuthUser() user,
    @Param('id') id: string,
    @Body() data: UpdateCampaignDto,
  ) {
    const campaign = await this.campaignService.update(id, data, user);
    const adscreenId = await this.adScreensService.findDeviceById(
      campaign.adScreen.toHexString(),
    );
    const publicAdvert =
      await this.publicAdvertsService.displayAdAndConfiguration(
        adscreenId.deviceId,
      );
    await this.advertUpdateService.addToQueue(publicAdvert);
    return {
      statusCode: HttpStatus.OK,
      message: 'Campaign updated successfully',
    };
  }

  @Get('campaigns/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns a single Campaign',
    type: CampaignDto,
  })
  findOne(@AuthUser() user, @Param('id') id: string) {
    return this.campaignService.findOneById(id, user);
  }

  @Get('campaigns/active/count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns the number of active campaigns',
  })
  activeCampaignCount(@AuthUser() user: UserAuthInfo) {
    return this.campaignService.countActiveCampaigns(user);
  }

  @Get('campaigns-count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns the number of campaigns created',
  })
  CampaignCount(@AuthUser() user: UserAuthInfo) {
    return this.campaignService.countCampaign(user);
  }

  @Get('screen/:adScreenId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns all ad accounts related to a ad screen',
  })
  async findAllCampaignAdAccounts(@Param('adScreenId') adScreenId: string) {
    return this.campaignService.getScreenAdAccounts(adScreenId);
  }

  @Get('campaigns-schedule-display')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns all ad accounts and ad screens related to a campaign',
  })
  campaignScheduleDisplay(@Param('adScreen') adScreen: string) {
    return this.campaignService.getCampaignScheduleDisplay(adScreen);
  }

  @Put('campaigns/update-sequence-order')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: [CampaignSequenceDto] })
  @ApiOkResponse({
    description:
      'Updates an existing Campaign sequence order with the new order numbers sent in the request',
    type: [CampaignDto],
  })
  async updateCampaignSequenceOrder(
    @AuthUser() user,
    @Body() data: [CampaignSequenceDto],
  ) {
    const order = await this.campaignService.sequenceCampaignByOrder(data);

    const campaign = await this.campaignService.findOneById(order[0]._id, user);

    const adscreenId = await this.adScreensService.findDeviceById(
      campaign.adScreen.toHexString(),
    );
    const publicAdvert =
      await this.publicAdvertsService.displayAdAndConfiguration(
        adscreenId.deviceId,
      );
    await this.advertUpdateService.addToQueue(publicAdvert);
    return order;
  }

  @Get('campaigns/:adAccount/get-campaign-count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns the number of campaigns related to a ad account',
  })
  async findAllCampaignsByAdAccount(@Param('adAccount') adAccount: string) {
    return this.campaignService.getCampaignsCountByAdAccount(adAccount);
  }

  @Get(':id/get-campaign-and-adverts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns the campaign information along with the adverts',
    type: CampaignDto,
  })
  async campaignAndAdverts(@Param('id') id: string) {
    return this.campaignService.getCampaignInfoAndAdverts(id);
  }

  @Delete('campaigns/:id/delete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Deletes an existing Campaign',
  })
  async delete(@AuthUser() user, @Param('id') id: string) {
    const userId = user._id;
    return this.campaignService.delete(id, userId);
  }

  @Get('send-to-device/:screenId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns the campaign information along with the adverts',
  })
  async sendToDevice(@Param('screenId') screenId: string) {
    const adscreenId = await this.adScreensService.findDeviceById(screenId);
    const publicAdvert =
      await this.publicAdvertsService.displayAdAndConfiguration(
        adscreenId.deviceId,
      );
    await this.advertUpdateService.addToQueue(publicAdvert);

    return {
      statusCode: HttpStatus.OK,
      message: 'Campaign sent to device successfully',
    };
  }
}
