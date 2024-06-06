import { Injectable } from '@nestjs/common';

import { AdvertUpdateProcessor } from './processors/advert-update.processor';
import { IPublicAdvertAdvert } from './types/queues.type';
@Injectable()
export class AdvertUpdateService {
  constructor(private advertUpdateProcessor: AdvertUpdateProcessor) {}

  async addToQueue(publicAdvert: IPublicAdvertAdvert) {
    await this.advertUpdateProcessor.processadvertUpdateQueue(publicAdvert);
  }
}
