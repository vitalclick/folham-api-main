import { HttpService } from '@nestjs/axios';
import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import fetch from 'cross-fetch';
import { Types } from 'mongoose';
import { PublicAdvertsService } from '../public-adverts/public-adverts.service';
import { AdvertUpdateService } from '../queues/advert-update.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { ActionType } from '../activity-log/types/action-type.types';
import { AdScreensService } from '../ad-screens/ad-screens.service';
// import { RedisService } from '../common/services/redis/redis.service';
import { AddNewWidgetDto } from './dto/add-new-widget.dto';
import { Widgets } from './schema/widgets.schema';
import { WeatherResult } from './types/widget.type';
import { WidgetsRepository } from './widgets.repository';
import { MemcacheService } from '../common/services/memcache/memcache.service';

@Injectable()
export class WidgetsService {
  constructor(
    private widgetsRepository: WidgetsRepository,
    private adScreensService: AdScreensService,
    private activityLogService: ActivityLogService,
    @Inject(forwardRef(() => PublicAdvertsService))
    private readonly publicAdvertsService: PublicAdvertsService,
    @Inject(forwardRef(() => AdvertUpdateService))
    private advertUpdateService: AdvertUpdateService,
    // private redisService: RedisService,
    private memcacheService: MemcacheService,
  ) {}

  async getScreenWidget(screenId: string): Promise<Widgets[]> {
    try {
      const result = await this.widgetsRepository.findAll({
        screenId: new Types.ObjectId(screenId),
      });
      if (!result) {
        throw new NotFoundException('Widget not found');
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  async createNewWidget(payload: AddNewWidgetDto): Promise<Widgets> {
    const [existingWidget, adScreen] = await Promise.all([
      this.widgetsRepository.findOne({
        screenId: new Types.ObjectId(payload.screenId),
        widgetType: payload.widgetType,
      }),
      this.adScreensService.findDeviceById(payload.screenId),
    ]);
    if (existingWidget) {
      throw new ConflictException('Widget already exists / already added');
    }
    if (!adScreen) {
      throw new NotFoundException('Invalid screen Id / Device Id provided');
    }
    try {
      const newWidget = new Widgets();
      Object.assign(newWidget, payload);
      const createdWidget = await this.widgetsRepository.create(newWidget);
      if (createdWidget) {
        const log = {
          message:
            ActionType.added_new_widget +
            ': ' +
            createdWidget.widgetType +
            ' to ' +
            adScreen.name,
        };
        this.activityLogService.saveActivityLog(log);
      }
      const publicAdvert =
        await this.publicAdvertsService.displayAdAndConfiguration(
          adScreen.deviceId,
        );
      await this.advertUpdateService.addToQueue(publicAdvert);
      return createdWidget;
    } catch (error) {
      throw error;
    }
  }

  async removeWidget(payload: AddNewWidgetDto): Promise<Widgets> {
    try {
      const [existingWidget, adScreen] = await Promise.all([
        this.widgetsRepository.findOne({
          screenId: new Types.ObjectId(payload.screenId),
          widgetType: payload.widgetType,
        }),
        this.adScreensService.findDeviceById(payload.screenId),
      ]);

      if (!existingWidget) {
        throw new NotFoundException(
          'Widget does not exist. Please kindly reconfirm ',
        );
      }
      const deletedWidget = await this.widgetsRepository.delete(payload);
      if (deletedWidget) {
        const log = {
          message:
            ActionType.removed_widget +
            ': ' +
            existingWidget.widgetType +
            ' from ' +
            adScreen.name,
        };
        this.activityLogService.saveActivityLog(log);
      }

      const publicAdvert =
        await this.publicAdvertsService.displayAdAndConfiguration(
          adScreen.deviceId,
        );
      await this.advertUpdateService.addToQueue(publicAdvert);
      return deletedWidget;
    } catch (error) {
      throw error;
    }
  }

  async getScreenLiveWeather(city: string) {
    try {
      const weather = await this.memcacheService.get(city);
      if (weather) {
        return weather;
      }
      if (!weather) {
        const weatherData = await this.getWeatherData(`${city},ng`);
        await this.memcacheService.set(
          city,
          JSON.stringify(weatherData),
          14400,
        );
        return weatherData;
      }
    } catch (error) {
      throw new NotFoundException('Invalid screen Id / Device Id provided');
    }
  }

  async updateLiveWeatherData() {
    const cities = await this.adScreensService.findDistinctCities();
    if (!cities) {
      return;
    }

    const cityLiveWeather = await Promise.all(
      cities.map(async (city) => {
        const weather = await this.getWeatherData(`${city},ng`);
        await this.memcacheService.set(city, JSON.stringify(weather), 14400);
        return weather;
      }),
    );

    return cityLiveWeather;
  }

  async getWeatherData(city: string) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=bd1fa46746b59a67d568a0bbd090a1d4`;
    const response: WeatherResult = await fetch(url).then((res) => res.json());
    const weather = {
      city: response.name,
      temperature: `${Math.round(response.main.temp - 273.15)} °C`,
      humidity: `${response.main.humidity} %`,
      windSpeed: `${response.wind.speed} meter/sec`,
      visibility: `${response.visibility} meter`,
      weather: response.weather[0].main,
      weatherDescription: response.weather[0].description,
      weatherIcon: response.weather[0].icon,
      lastUpdated: new Date(),
    };
    return weather;
  }
}
