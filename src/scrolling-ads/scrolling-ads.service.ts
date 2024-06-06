import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ScrollingAdsRepository } from './scrolling-ads.repository';
import { CreateScrollingAdsDto } from './dto/create-scrolling-ads';
import { AdScreensRepository } from '../ad-screens/ad-screens.repository';
import { ContentDetailsRepository } from './content-details.repository';
import { UpdateContentDetailsDto } from './dto/update-scrolling-ads.dto';
import { UpdateScrollingAdsDto } from './dto/update-content-detail.dto';
import { ContentDetails } from './schema/content-details.schema';
import { CreateContentDetailsDto } from './dto/create-content-details.dto';
import { ResponseCode, processResponse } from 'src/common/utils/response';

@Injectable()
export class ScrollingAdsService {
  constructor(
    private readonly scrollingAdsRepository: ScrollingAdsRepository,
    private readonly contentDetailsRepository: ContentDetailsRepository,
    private adScreenRepository: AdScreensRepository,
  ) {}

  async createScrollingAd(scrollingAdsDto: CreateScrollingAdsDto) {
    const { type, screenIds, name, startTime, endTime } = scrollingAdsDto;

    try {
      // Check if screenId is provided
      if (!screenIds || screenIds.length === 0) {
        throw new BadRequestException('ScreenId is required');
      }

      const createdScrollingAds = [];

      for (const screenId of screenIds) {
        // Check if screenId exists
        const screen = await this.adScreenRepository.findOneById({
          _id: new Types.ObjectId(screenId),
        });

        if (!screen) {
          throw new NotFoundException(`Screen with ID ${screenId} not found`);
        }

        // Create scrollingAd
        const scrollingAd = {
          screenIds: screenIds.map((id) => new Types.ObjectId(id)),
          type,
          name: name,
          isActive: true,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
        };

        const createdScrollingAd = await this.scrollingAdsRepository.create(
          scrollingAd,
        );

        createdScrollingAds.push(createdScrollingAd);

        return processResponse(
          ResponseCode.SUCCESS,
          'Scrolling Ad created successfully',
          createdScrollingAd,
        );
      }
    } catch (error) {
      return processResponse(
        ResponseCode.FAILURE,
        'Failed to create',
        error.message,
      );
    }
  }

  async updateScrollingAd(scrollingAdId: string, data: UpdateScrollingAdsDto) {
    const scrollingAd = await this.scrollingAdsRepository.findOne({
      _id: new Types.ObjectId(scrollingAdId),
    });

    if (!scrollingAd) {
      throw new NotFoundException('The ScrollingAd specified does not exist');
    }
    const updateScrollingAd = await this.scrollingAdsRepository.updateOne(
      scrollingAd._id,
      data,
    );
    return updateScrollingAd;
  }

  /**
   * TODO:
   */

  // Add screens to a scrolling ad
  async addScreensToScrollingAd(scrollingAdId: string, screenIds: string[]) {
    try {
      const scrollingAd = await this.scrollingAdsRepository.findOneById({
        _id: new Types.ObjectId(scrollingAdId),
      });

      if (!scrollingAd) {
        throw new NotFoundException('The ScrollingAd specified does not exist');
      }

      for (const screenId of screenIds) {
        // Check if screenId exists
        const screen = await this.adScreenRepository.findOneById({
          _id: new Types.ObjectId(screenId),
        });

        if (!screen) {
          throw new NotFoundException(`Screen with ID ${screenId} not found`);
        }

        // Check if the screen is already added to the scrolling ad
        if (!scrollingAd.screenIds.includes(screen._id.toString())) {
          scrollingAd.screenIds.push(screen._id.toString());
        }
      }

      const updatedScrollingAd = await this.scrollingAdsRepository.updateOne(
        scrollingAd._id,
        { screenIds: scrollingAd.screenIds },
      );

      return updatedScrollingAd;
    } catch (error) {
      return processResponse(
        ResponseCode.FAILURE,
        'Error adding screen to scrolling ad',
        error.message,
      );
    }
  }

  // Remove screens from a scrolling ad
  async removeScreensFromScrollingAd(
    scrollingAdId: string,
    screenIds: string[],
  ) {
    try {
      const scrollingAd = await this.scrollingAdsRepository.findOneById({
        _id: new Types.ObjectId(scrollingAdId),
      });

      if (!scrollingAd) {
        throw new NotFoundException('The ScrollingAd specified does not exist');
      }

      for (const screenId of screenIds) {
        // Check if the screen is added to the scrolling ad
        const index = scrollingAd.screenIds.indexOf(
          new Types.ObjectId(screenId),
        );

        if (index !== -1) {
          scrollingAd.screenIds.splice(index, 1);
        }
      }

      const updatedScrollingAd = await this.scrollingAdsRepository.updateOne(
        scrollingAd._id,
        { screenIds: scrollingAd.screenIds },
      );

      return updatedScrollingAd;
    } catch (error) {
      return processResponse(
        ResponseCode.FAILURE,
        'Error removing screen from scrolling ad',
        error.message,
      );
    }
  }

  async deleteScrollingAd(scrollingAdId: string) {
    return this.scrollingAdsRepository.delete({
      _id: new Types.ObjectId(scrollingAdId),
    });
  }

  async createContentDetails(
    createContentDetailsDto: CreateContentDetailsDto[],
  ) {
    try {
      const createdContentDetailsArray = await Promise.all(
        createContentDetailsDto.map(async (createContentDetailsDto) => {
          // Check if scrollingAdsId exists
          const scrollingAd = await this.scrollingAdsRepository.findOneById({
            _id: new Types.ObjectId(createContentDetailsDto.scrollingAdId),
          });

          // Ensure scrolling ad exists before continuing
          if (!scrollingAd) {
            throw new NotFoundException(
              `Scrolling Ad with ID ${createContentDetailsDto.scrollingAdId} not found`,
            );
          }

          // Create content details
          const contentDetails = new ContentDetails();
          contentDetails.message = createContentDetailsDto.message;
          contentDetails.scrollingAdId = new Types.ObjectId(
            createContentDetailsDto.scrollingAdId,
          );

          const createdContentDetail =
            await this.contentDetailsRepository.create(contentDetails);

          const processedResponse = processResponse(
            ResponseCode.SUCCESS,
            'Content details created successfully',
            createdContentDetail,
          );

          return (await processedResponse).data; // Extract the data from the processed response
        }),
      );

      return {
        message: 'Success',
        error: false,
        data: createdContentDetailsArray,
      };
    } catch (error) {
      return processResponse(
        ResponseCode.FAILURE,
        'Content details not created, Try again',
        error.message,
      );
    }
  }

  async updateContentDetails(
    contentDetailId: string,
    data: UpdateContentDetailsDto,
  ) {
    const contentDetail = await this.contentDetailsRepository.findOne({
      _id: new Types.ObjectId(contentDetailId),
    });

    if (!contentDetail) {
      throw new NotFoundException('The ContentDetail specified does not exist');
    }
    const updateContentDetail = await this.contentDetailsRepository.updateOne(
      contentDetail._id,
      data,
    );
    return updateContentDetail;
  }

  async getAllScrollingAdsDetailsByScreenId(
    screenIds: string | string[],
    options: {
      isActive?: boolean;
    } = {},
  ) {
    const idsArray = Array.isArray(screenIds)
      ? screenIds
      : screenIds.split(',');

    // Validate each ID to ensure it is a valid hexadecimal string
    idsArray.forEach((id) => {
      if (!Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid ObjectId: ${id}`);
      }
    });

    const objectIds = idsArray.map((id) => new Types.ObjectId(id));

    try {
      const result =
        await this.scrollingAdsRepository.getAllScrollingAdsDetailsByScreenId(
          objectIds.map((objectId) => objectId.toHexString()),
        );

      const filteredResult = result.filter((ad) => {
        if (
          options.isActive !== undefined &&
          Boolean(ad.isActive) !== Boolean(options.isActive)
        ) {
          return false;
        }

        return true;
      });

      console.log('Filtered Result:', filteredResult);

      return processResponse(
        ResponseCode.SUCCESS,
        'All Scrolling Ads Details Gotten by Screen Id',
        filteredResult,
      );
    } catch (error) {
      return processResponse(
        ResponseCode.FAILURE,
        'Error Getting All Scrolling Ads Details Gotten by Screen Id',
        error.message,
      );
    }
  }

  async deleteContentDetails(contentDetailId: string) {
    return this.contentDetailsRepository.delete({
      _id: new Types.ObjectId(contentDetailId),
    });
  }

  async getScrollingAdsByScreenId(screenId: string) {
    return this.scrollingAdsRepository.find({
      screenId: new Types.ObjectId(screenId),
    });
  }

  async findScrollingAds(findQuery) {
    return this.scrollingAdsRepository.find(findQuery);
  }

  async findOneScrollingAds(query) {
    return this.scrollingAdsRepository.findOne(query);
  }
}
