import { Controller, Get, Post, Body } from '@nestjs/common';
import { LongAndLatDto } from './dto/long-lat.dto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AdscreenCityService } from './ad-screen-city.service';

@ApiTags('ad-screen-city')
@Controller('ad-screen-city')
export class AdscreenCityController {
  constructor(private readonly adscreenCityService: AdscreenCityService) {}

  @Post()
  @ApiOkResponse({
    description: 'Returns the longitude and latitude of a city',
  })
  async getLongAndLatByCityName(@Body() findLongAndLatDto: LongAndLatDto) {
    return this.adscreenCityService.getLongitudeAndLatitudeByCityName(
      findLongAndLatDto.city,
    );
  }

  @Get('all-cities')
  @ApiOkResponse({
    description: 'Returns all the cities',
    type: [String],
  })
  async getAllCities() {
    return this.adscreenCityService.getAllCities();
  }
}
