import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthUser } from '../common/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ScrollingAdsService } from './scrolling-ads.service';
import { CreateScrollingAdsDto } from './dto/create-scrolling-ads';
import { UpdateScrollingAdsDto } from './dto/update-content-detail.dto';
import { UpdateContentDetailsDto } from './dto/update-scrolling-ads.dto';
import { CreateContentDetailsDto } from './dto/create-content-details.dto';

@ApiTags('scrolling-ads')
@Controller('scrollingAds')
export class ScrollingAdsController {
  constructor(private readonly scrollingAdsService: ScrollingAdsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Creates a new scrolling ad for a screen',
    type: CreateScrollingAdsDto,
  })
  async createScrollindAd(
    @AuthUser() user,
    @Body() createScrollinAdDto: CreateScrollingAdsDto,
  ) {
    if (!['admin', 'superAdmin'].includes(user.privilege)) {
      throw new NotFoundException(
        'Only admin can add scrolling ads, to this screen',
      );
    }
    return this.scrollingAdsService.createScrollingAd(createScrollinAdDto);
  }

  @Post('content-detail/create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Creates a new content details for a scrolling ad',
    type: [CreateContentDetailsDto],
  })
  @ApiBody({
    type: [CreateContentDetailsDto],
  })
  async createContentDetail(
    @AuthUser() user,
    @Body() createContentDetailDto: [CreateContentDetailsDto],
  ) {
    if (!['admin', 'superAdmin'].includes(user.privilege)) {
      throw new NotFoundException(
        'Only admin can add content details, to this scrolling ad',
      );
    }
    return this.scrollingAdsService.createContentDetails(
      createContentDetailDto,
    );
  }

  @Get('all-scrolling-ads-details/:screenIds')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Finds all scrolling ads on a screen',
  })
  async getAllScrollingAdsDetailsByScreenId(
    @Param('screenIds') screenIds: string[],
    @Query('isActive') isActive?: string,
  ) {
    const parsedIsActive = isActive === 'true';
    return this.scrollingAdsService.getAllScrollingAdsDetailsByScreenId(
      screenIds,
      {
        isActive: parsedIsActive,
      },
    );
  }

  @Put('/add-screens/:scrollingAdId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Add screens to a scrolling ad',
    type: UpdateScrollingAdsDto,
  })
  async addScreensToScrollingAd(
    @AuthUser() user,
    @Query('scrollingAdId') scrollingAdId: string,
    @Body() screenIds: string[],
  ) {
    if (!['admin', 'superAdmin'].includes(user.privilege)) {
      throw new NotFoundException(
        'Only admin can add screens to this scrolling ad',
      );
    }
    return this.scrollingAdsService.addScreensToScrollingAd(
      scrollingAdId,
      screenIds,
    );
  }

  @Put('/remove-screens/:scrollingAdId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Remove screens from a scrolling ad',
    type: UpdateScrollingAdsDto,
  })
  async removeScreensFromScrollingAd(
    @AuthUser() user,
    @Param('scrollingAdId') scrollingAdId: string,
    @Body() screenIds: string[],
  ) {
    if (!['admin', 'superAdmin'].includes(user.privilege)) {
      throw new NotFoundException(
        'Only admin can remove screens from this scrolling ad',
      );
    }
    return this.scrollingAdsService.removeScreensFromScrollingAd(
      scrollingAdId,
      screenIds,
    );
  }

  @Put('/update-scrolling-ads/:scrollingAdId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Update a scrolling ad for a screen',
    type: CreateScrollingAdsDto,
  })
  async updateScrollindAd(
    @AuthUser() user,
    @Param('scrollingAdId') scrollingAdId: string,
    @Body() updateScrollingAdsDto: UpdateScrollingAdsDto,
  ) {
    if (!['admin', 'superAdmin'].includes(user.privilege)) {
      throw new NotFoundException(
        'Only admin can update scrolling ads, to this screen',
      );
    }
    return this.scrollingAdsService.updateScrollingAd(
      scrollingAdId,
      updateScrollingAdsDto,
    );
  }

  @Delete('/delete-scrolling-ads/:scrollingAdId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Delete a scrolling ad for a screen',
  })
  async deleteScrollindAd(
    @AuthUser() user,
    @Param('scrollingAdId') scrollingAdId: string,
  ) {
    if (!['admin', 'superAdmin'].includes(user.privilege)) {
      throw new NotFoundException(
        'Only admin can delete scrolling ads, to this screen',
      );
    }
    return this.scrollingAdsService.deleteScrollingAd(scrollingAdId);
  }

  @Put('/update-content-detail/:contentDetailId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Update a content detail for a scrolling ad',
    type: UpdateContentDetailsDto,
  })
  async updateContentDetail(
    @AuthUser() user,
    @Param('contentDetailId') contentDetailId: string,
    @Body() updateContentDetailDto: UpdateContentDetailsDto,
  ) {
    if (!['admin', 'superAdmin'].includes(user.privilege)) {
      throw new NotFoundException(
        'Only admin can update content detail, to this scrolling ad',
      );
    }
    return this.scrollingAdsService.updateContentDetails(
      contentDetailId,
      updateContentDetailDto,
    );
  }

  @Delete('/delete-content-detail/:contentDetailId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Delete a content detail for a scrolling ad',
  })
  async deleteContentDetail(
    @AuthUser() user,
    @Param('contentDetailId') contentDetailId: string,
  ) {
    if (!['admin', 'superAdmin'].includes(user.privilege)) {
      throw new NotFoundException(
        'Only admin can delete content detail for a scrolling ad',
      );
    }
    return this.scrollingAdsService.deleteContentDetails(contentDetailId);
  }

  //TODO:  Get get all the scrolling ads and content for a screen
}
