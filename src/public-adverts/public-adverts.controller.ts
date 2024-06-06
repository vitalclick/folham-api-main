import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PublicAdvertsService } from './public-adverts.service';

@ApiTags('public-adverts')
@Controller('public-adverts')
export class PublicAdvertsController {
  constructor(private readonly publicAdvertService: PublicAdvertsService) {}

  @Get('ad-image-and-configuration/:deviceId')
  @ApiOkResponse({
    description:
      'Returns the ad image and configuration for the given deviceId',
  })
  async getAdImageAndConfiguration(@Param('deviceId') deviceId: string) {
    const adData = await this.publicAdvertService.displayAdAndConfiguration(
      deviceId,
    );
    return adData;
  }

  @Get('split-screen/ad-image-and-configuration/:deviceId')
  @ApiOkResponse({
    description:
      'Returns the ad image and configuration for the given deviceId',
  })
  async getAdImageAndConfigurationForSplitScreen(
    @Param('deviceId') deviceId: string,
  ) {
    const adData =
      await this.publicAdvertService.displayAdAndConfigurationSplitScreen(
        deviceId,
      );
    return adData;
  }
}
