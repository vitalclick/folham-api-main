export const QueuesRegistered = {
  deviceLog: 'deviceLog',
  advertUpdate: 'advertUpdate',
  screenStatus: 'screenStatus',
  scrollingAdvert: 'scrollingAdvert',
};

export const QueueJobTypes = {
  deviceLog: 'deviceLog',
};

export interface IPublicAdvertAdvert {
  config: {
    screenId: any;
    deviceId: any;
    ttl: string;
    screenResolution: string;
    layout: string;
  };
  data: IPublicAdvertCampaign[] | any[];
}
export interface IScrollingAdvertData {
  config: {
    name: string;
    type: string;
    // content: string;
    isActive: boolean;
    startTime: string;
    endTime: string;
    screenId: any;
    deviceId?: any;
  };
}
