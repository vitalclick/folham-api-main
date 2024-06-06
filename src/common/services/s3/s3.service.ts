// import { Injectable } from '@nestjs/common';
// import * as aws from 'aws-sdk';
// import { appConstant } from '../../../common/constants/app.constant';
// import * as path from 'path';
// import { v4 } from 'uuid';
// import { S3ImageType } from '../../enums/imageType';

// const imageResolutionMapping = {
//   [S3ImageType.profilePicture]: { height: '300', width: '300' },
// };
// @Injectable()
// export class S3Service {
//   private readonly s3Client: aws.S3;

//   constructor() {
//     this.s3Client = new aws.S3();
//   }

//   async uploadImage(
//     file: Express.Multer.File,
//     userId: string,
//     imageType: S3ImageType,
//   ) {
//     const extension = path.extname(file.originalname);
//     const s3Key = `uploaded/${userId}-${
//       S3ImageType[imageType]
//     }-${v4()}${extension}`;

//     const { Location } = await this.s3Client
//       .upload({
//         Bucket: appConstant.S3.PROFILE_BUCKET_NAME,
//         Body: file.buffer,
//         Key: s3Key,
//         Metadata: imageResolutionMapping[imageType],
//       })
//       .promise();

//     // TODO Should replace
//     // Being Optimistic here that it works properly
//     return Location.replace('uploaded', 'thumbnails');
//   }
// }
