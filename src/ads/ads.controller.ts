import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../common/decorators/user.decorator';
import { AdsService } from './ads.service';
import { AdsDto } from './dto/ad.dto';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { UserAuthInfo } from '../users/interface/user.interface';

@ApiTags('ads')
@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Creates a new ad screen',
    type: AdsDto,
  })
  async create(@AuthUser() user, @Body() createAdsDto: CreateAdDto) {
    return this.adsService.create(createAdsDto, user);
  }

  @Get('get/all-ads')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns all available ads',
    type: [AdsDto],
  })
  async findAll(@AuthUser() user: UserAuthInfo) {
    return this.adsService.findAll(user);
  }

  @Put(':id/update')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Updates an existing Ad with the newly sent fields',
    type: AdsDto,
  })
  async update(
    @AuthUser() user,
    @Param('id') id: string,
    @Body() data: UpdateAdDto,
  ) {
    await this.adsService.update(id, data, user);
    return {
      statusCode: HttpStatus.OK,
      message: 'Ads updated successfully',
    };
  }

  @Get('get-one-ad/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns a single advertisement',
    type: AdsDto,
  })
  async findOne(@AuthUser() user, @Param('id') id: string) {
    return this.adsService.findOneById(id, user);
  }

  @Delete(':id/delete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Deletes an existing advertisement',
  })
  async delete(@AuthUser() user, @Param('id') id: string): Promise<any> {
    return this.adsService.delete(id, user);
  }

  @Get('get-ads/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns a single advertisement',
    type: AdsDto,
  })
  async findAllAdsOfAdAccount(@Param('id') id: string) {
    return this.adsService.retrieveAdsByAdAccount(id);
  }
}
