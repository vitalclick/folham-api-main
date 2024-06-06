import { Module } from '@nestjs/common';
import { AdscreenCityController } from './ad-screen-city.controller';
import { AdscreenCityService } from './ad-screen-city.service';

@Module({
  controllers: [AdscreenCityController],
  providers: [AdscreenCityService],
})
export class AdscreenCityModule {}
