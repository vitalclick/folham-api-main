import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { FilterQuery, Model, QueryOptions, Types, UpdateQuery } from 'mongoose';
import {
  ContentDetails,
  ContentDetailsDocument,
} from './schema/content-details.schema';
import { CreateContentDetailsDto } from './dto/create-content-details.dto';

@Injectable()
export class ContentDetailsRepository {
  constructor(
    @InjectModel(ContentDetails.name)
    private model: Model<ContentDetailsDocument>,
  ) {}

  public async create(contentDetailsDto): Promise<ContentDetailsDocument> {
    return this.model.create(contentDetailsDto);
  }

  public async find(
    findQuery?: FilterQuery<ContentDetailsDocument>,
    option?: QueryOptions,
    extra?: any,
  ): Promise<ContentDetailsDocument[]> {
    return this.model
      .find(findQuery, option, extra)
      .sort({ createdAt: 1 })
      .exec();
  }

  public async findOne(query: FilterQuery<ContentDetailsDocument>) {
    const contentDetails = await this.model.findOne(query);
    return contentDetails;
  }

  public async findOneContentDetails(
    query: FilterQuery<ContentDetailsDocument>,
  ) {
    return this.model.findOne(query);
  }

  findOneById(query: FilterQuery<ContentDetailsDocument>) {
    return this.model.findOne(query);
  }

  public async updateOne(
    id: Types.ObjectId,
    updateQuery?: UpdateQuery<Partial<ContentDetailsDocument>>,
  ): Promise<ContentDetailsDocument> {
    return this.model.findOneAndUpdate({ _id: id }, updateQuery, {
      new: true,
    });
  }

  public async delete(query: FilterQuery<ContentDetailsDocument>) {
    return this.model.findByIdAndDelete(query);
  }

  public async deleteMany(query: FilterQuery<ContentDetailsDocument>) {
    return this.model.deleteMany(query);
  }
}
