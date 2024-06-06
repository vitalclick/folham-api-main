export enum MessageType {
  play = 'play',
  failed = 'fail',
  canceled = 'canceled',
}
export interface DeviceLog {
  deviceId: string;
  adId: string;
  accountId: string;
  campaignId: string;
  messageType: MessageType;
  loggedOn: string;
}

export interface IAdvertUpdateData {
  config: {
    screenId: any;
    deviceId: string;
    ttl: string;
    screenResolution: string;
    layout: string;
  };
  data: any[];
}

export interface IScrollingAdvertData {
  config: {
    name: string;
    type: string;
    content: string;
    isActive: boolean;
    startTime: string;
    endTime: string;
    screenId: string;
    deviceId: string;
  };
}

export const QueuesRegistered = {
  deviceLog: 'deviceLog',
  advertUpdate: 'advertUpdate',
  screenStatus: 'screenStatus',
  scrollingAdvert: 'scrollingAdvert',
};

export interface IScreenStatusData {
  id: string;
  screenId: any;
  screenName: string;
  deviceId: string;
  status: string;
}
