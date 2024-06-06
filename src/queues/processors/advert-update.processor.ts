import { Injectable } from '@nestjs/common';
import { EventsGateway } from '../event-gateway/events.gateway';
import { IPublicAdvertAdvert } from '../types/queues.type';

@Injectable()
export class AdvertUpdateProcessor {
  constructor(private eventsGateway: EventsGateway) {}
  async processadvertUpdateQueue(data: IPublicAdvertAdvert) {
    this.eventsGateway.emitUpdatedAds(data);
    return {};
  }
}
