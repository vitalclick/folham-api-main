import { forwardRef, Module } from '@nestjs/common';
import { DeviceLogsModule } from '../device-logs/device-logs.module';
import { AdvertUpdateService } from './advert-update.service';
import { LogQueueService } from './log-queue.service';

import { EventsGateway } from './event-gateway/events.gateway';
import { ScreenStatusProcessor } from './processors/screen-status.processor';
import { AdvertUpdateProcessor } from './processors/advert-update.processor';

@Module({
  imports: [forwardRef(() => DeviceLogsModule)],
  providers: [
    LogQueueService,
    AdvertUpdateService,
    EventsGateway,
    AdvertUpdateProcessor,
    ScreenStatusProcessor,
  ],
  exports: [AdvertUpdateService, EventsGateway, LogQueueService],
})
export class QueuesModule {}
