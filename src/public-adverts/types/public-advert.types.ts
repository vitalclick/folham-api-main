interface IPublicAdvertCampaign {
  campaignId: string;
  adAccountId: string;
  adId: string;
  adUrl: string;
  adConfiguration: {
    duration: number;
    startTime: string;
    endTime: string;
    days: string[];
  };
}
