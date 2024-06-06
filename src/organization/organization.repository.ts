import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Organization,
  OrganizationDocument,
} from './schema/organization.schema';
import { FilterQuery, Model, QueryOptions, Types, UpdateQuery } from 'mongoose';

@Injectable()
export class OrganizationRepository {
  constructor(
    @InjectModel(Organization.name)
    private model: Model<OrganizationDocument>,
  ) {}

  public async create(organizationDto): Promise<OrganizationDocument> {
    return this.model.create(organizationDto);
  }

  public async find(
    findQuery?: FilterQuery<OrganizationDocument>,
    option?: QueryOptions,
    extra?: any,
  ): Promise<Organization[]> {
    return this.model.find(findQuery, option, extra).sort({ order: 1 }).exec();
  }

  public async findOne(query: FilterQuery<OrganizationDocument>) {
    const organization = await this.model.findOne(query);
    return organization;
  }

  public async findOneOrganization(
    query: FilterQuery<OrganizationDocument>,
    sort,
  ) {
    return this.model.findOne(query).sort(sort);
  }

  findOneById(query: FilterQuery<OrganizationDocument>) {
    return this.model.findOne(query);
  }

  public async updateOne(
    id: Types.ObjectId,
    updateQuery?: UpdateQuery<Partial<OrganizationDocument>>,
  ): Promise<OrganizationDocument> {
    return this.model.findOneAndUpdate({ _id: id }, updateQuery, {
      new: true,
    });
  }

  public async delete(query: FilterQuery<OrganizationDocument>) {
    return this.model.findByIdAndDelete(query);
  }
}
