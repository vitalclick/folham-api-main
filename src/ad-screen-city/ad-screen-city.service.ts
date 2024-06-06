import { Injectable, NotFoundException } from '@nestjs/common';
import { CitiesLatitudeLongitude } from './data/cities-lat-long';

@Injectable()
export class AdscreenCityService {
  async getLongitudeAndLatitudeByCityName(city: string) {
    const lonLat = CitiesLatitudeLongitude.find((item) => item.city === city);
    if (!lonLat) {
      throw new NotFoundException(
        'City not found, Please kindly select the nearest city',
      );
    }
    return {
      longitude: lonLat.lng,
      latitude: lonLat.lat,
    };
  }

  async getAllCities(): Promise<string[]> {
    return CitiesLatitudeLongitude.map((item) => {
      return item.city;
    });
  }
}
