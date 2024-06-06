import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddNewWidgetDto } from './dto/add-new-widget.dto';
import { WidgetConfigurationDto } from './dto/widget-configuration.dto';
import { WidgetsService } from './widgets.service';

@ApiTags('widgets')
@Controller()
export class WidgetsController {
  constructor(private widgetsService: WidgetsService) {}

  @Get('get-widgets/:screenId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Get a screen widgets using the widget Id',
    type: WidgetConfigurationDto,
  })
  async getScreenWidgets(@Param('screenId') screenId: string): Promise<any> {
    return this.widgetsService.getScreenWidget(screenId);
  }

  @Post('add/widget')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Adds the configuration of a screen widget to the database',
    type: WidgetConfigurationDto,
  })
  async saveWidgetConfiguration(@Body() payload: AddNewWidgetDto) {
    console.log('payload', payload);
    return this.widgetsService.createNewWidget(payload);
  }

  @Post('remove/widget')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description:
      'Removes the configuration of a screen widget from the database',
    type: WidgetConfigurationDto,
  })
  async removeWidgetConfiguration(@Body() payload: AddNewWidgetDto) {
    return this.widgetsService.removeWidget(payload);
  }

  @Get('screen-weather-details/:city')
  @ApiOkResponse({
    description: 'Returns the weather details of a location',
  })
  @Header('Content-Type', 'application/json')
  async getAllWeatherDetails(@Param('city') city: string) {
    return this.widgetsService.getScreenLiveWeather(city);
  }
}
