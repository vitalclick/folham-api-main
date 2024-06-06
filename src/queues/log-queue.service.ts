import { MessageType } from '../device-logs/types/device-log-message.type';
import { DeviceLogsService } from '../device-logs/device-logs.service';
import { Injectable } from '@nestjs/common';

export interface DeviceLogDto {
  adId: string;
  accountId: string;
  deviceId: string;
  campaignId: string;
  messageType: MessageType;
  loggedOn: string;
}

@Injectable()
export class LogQueueService {
  constructor(private deviceLogService: DeviceLogsService) {}
  async processListenProgressDetailsQueue(job: any) {
    try {
      const logs = this.parseRegexData(job as string);
      await this.deviceLogService.createLogs(logs);
    } catch (err) {
      console.log('err @@@@@@@@', err);
    }
    return {};
  }

  parseRegexData(data: string) {
    const jsonString = data.replace(/(\w+): ([^,}]+)/g, '"$1": "$2"');
    const jsonObject = JSON.parse(jsonString) as DeviceLogDto;
    return jsonObject;
  }
}
