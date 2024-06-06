export interface CampaignPostingNoficationBody {
  campaignName: string;
  screenName: string;
  playDuration: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  title: string;
}

export interface screenDetailsEmailBody {
  title: string;
  name: string;
  screenStatus: string;
  screenId: string;
}
