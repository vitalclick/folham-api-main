import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions, UpdateQuery } from 'mongoose';
import { CreateAdCompanyDto } from './dto/create-ad-company.dto';
import { AdCompany, AdCompanyDocument } from './schema/ad-company.schema';

@Injectable()
export class AdCompanyRepository {
  constructor(
    @InjectModel(AdCompany.name)
    private model: Model<AdCompanyDocument>,
  ) {}

  public async create(adCompanyDto): Promise<AdCompanyDocument> {
    return this.model.create(adCompanyDto);
  }

  public async find(
    findQuery?: FilterQuery<AdCompanyDocument>,
    option?: QueryOptions,
    extra?: any,
  ): Promise<AdCompany[]> {
    return this.model.find(findQuery, option, extra).exec();
  }

  public async findOne(query: FilterQuery<AdCompanyDocument>) {
    return this.model.findOne(query);
  }

  findOneById(query: FilterQuery<AdCompanyDocument>) {
    return this.model.findOne(query);
  }

  public async updateOne(
    id: string,
    updateQuery?: UpdateQuery<Partial<AdCompanyDocument>>,
  ): Promise<AdCompanyDocument> {
    return this.model.findOneAndUpdate({ _id: id }, updateQuery, {
      new: true,
    });
  }

  public async delete(query: FilterQuery<AdCompanyDocument>) {
    return this.model.findByIdAndDelete(query);
  }
}
