export enum CampaignActiveStatus {
  activated = 0,
  deactivated = 1,
  deleted = 2,
}

export enum CampaignType {
  image = 'image',
  video = 'video',
}

export const CampaignNotificationSchemaFilter = [
  {
    $lookup: {
      from: 'adscreens',
      localField: 'adScreen',
      foreignField: '_id',
      as: 'screen',
    },
  },
  {
    $unwind: {
      path: '$screen',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $addFields: {
      screenName: '$screen.name',
    },
  },
  {
    $project: {
      screen: 0,
      campaignScheduleDays: 0,
      adAccount: 0,
      adScreen: 0,
      createdAt: 0,
      updatedAt: 0,
    },
  },
];
