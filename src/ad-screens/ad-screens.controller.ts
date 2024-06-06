import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Delete,
  Param,
  Query,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PagingOptions } from '../activity-log/types/paging-options.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../common/decorators/user.decorator';
import { AdScreensService } from './ad-screens.service';
import { AdScreenDto } from './dto/ad-screen.dto';
import { CreateAdScreenDto } from './dto/create-ad-screen.dto';
import { UpdateAdScreenDto } from './dto/update-ad-screen.dto';
import { AdScreen } from './schema/ad-screen.schema';
import { UserAuthInfo } from '../users/interface/user.interface';

@ApiTags('ad-screens')
@Controller('ad-screens')
export class AdScreensController {
  constructor(private readonly adScreensService: AdScreensService) {}

  @Post('ad-screens/create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Creates a new ad screen',
    type: AdScreenDto,
  })
  create(
    @AuthUser() user: UserAuthInfo,
    @Body() createAdScreenDto: CreateAdScreenDto,
  ) {
    return this.adScreensService.create(createAdScreenDto, user);
  }

  @Get('ad-screens')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns all available ad Screens',
    type: [AdScreenDto],
  })
  findAll(
    @AuthUser() user: UserAuthInfo,
    @Query() pagination: PagingOptions,
  ): Promise<AdScreen[]> {
    return this.adScreensService.findAllScreens(user, pagination);
  }

  @Get('toggle-email-notification/:screenId/:status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Toggles Screen Notification',
    type: AdScreenDto,
  })
  toggleEmailNotification(
    @Param('status') status: string,
    @Param('screenId') screenId: string,
  ): Promise<AdScreen> {
    return this.adScreensService.toggleEmailNotification(
      screenId,
      status == 'true' ? true : false,
    );
  }

  @Get('ad-screen/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description:
      'Returns the ad Screen, the campaigns on the screen and the adverts on each campaign',
  })
  findOneScreenAndDetails(
    @AuthUser() user: UserAuthInfo,
    @Param('id') id: string,
  ) {
    return this.adScreensService.findOneById(id, user);
  }

  @Delete('ad-screen/:id/delete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Deletes an existing Ad Screen',
  })
  async delete(
    @AuthUser() user: UserAuthInfo,
    @Param('id') id: string,
  ): Promise<any> {
    return this.adScreensService.delete(id, user);
  }

  @Get('screen/count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns the number of screens',
  })
  screenCount() {
    /**
     *  TODO: Add user to the count such that it returns the number of screens for the user's organization
     *
     * */
    return this.adScreensService.countScreens();
  }

  @Put('screen/:id/update')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Updates screen details',
    type: AdScreenDto,
  })
  async updateUser(
    @AuthUser() user: UserAuthInfo,
    @Param('id') id: string,
    @Body() updateAdScreenDto: UpdateAdScreenDto,
  ): Promise<AdScreen> {
    return this.adScreensService.update(id, updateAdScreenDto, user);
  }
}
