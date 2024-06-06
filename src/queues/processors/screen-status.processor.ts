import { IScreenStatusData } from '../event-gateway/event.types';
import { EventsGateway } from '../event-gateway/events.gateway';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ScreenStatusProcessor {
  constructor(private eventsGateway: EventsGateway) {}

  async processadvertUpdateQueue(job: any) {
    const data = job.data as IScreenStatusData;
    this.eventsGateway.emitScreenStatus(data);
    return {};
  }
}
