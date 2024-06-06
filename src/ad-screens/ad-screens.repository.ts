import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions, Types, UpdateQuery } from 'mongoose';
import { PagingOptions } from '../activity-log/types/paging-options.types';
import { CreateAdScreenDto } from './dto/create-ad-screen.dto';
import { AdScreen, AdScreenDocument } from './schema/ad-screen.schema';
import { UserAuthInfo } from '../users/interface/user.interface';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class AdScreensRepository {
  constructor(
    @InjectModel(AdScreen.name)
    private model: Model<AdScreenDocument>,
  ) {}

  public async create(
    adScreensDto: CreateAdScreenDto,
  ): Promise<AdScreenDocument> {
    return this.model.create(adScreensDto);
  }

  public async find(
    findQuery?: FilterQuery<AdScreenDocument>,
    option?: QueryOptions,
    extra?: any,
  ): Promise<AdScreen[]> {
    return this.model.find(findQuery, option, extra).exec();
  }

  public async findOne(query: FilterQuery<AdScreenDocument>) {
    return this.model.findOne(query);
  }

  findOneById(query: FilterQuery<AdScreenDocument>) {
    return this.model.findOne(query);
  }

  public async updateOne(
    id: string,
    updateQuery?: UpdateQuery<Partial<AdScreenDocument>>,
  ): Promise<AdScreenDocument> {
    return this.model.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      updateQuery,
      {
        new: true,
      },
    );
  }

  public async delete(query: FilterQuery<AdScreenDocument>) {
    return this.model.findByIdAndDelete(query);
  }

  public async count(
    findQuery?: FilterQuery<AdScreenDocument>,
  ): Promise<number> {
    return this.model.find(findQuery).count();
  }

  public async countScreenStatus() {
    return this.model.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
  }

  public async getScreenId(query) {
    return this.model.findOne(query).exec();
  }

  async findWithPagination(
    user: UserAuthInfo,
    pagination: PagingOptions,
  ): Promise<AdScreen[]> {
    const loggedUser = new User(user as unknown as User);
    const organizationId = user.organizationId;
    if (
      (loggedUser.isAdmin() && !organizationId) ||
      loggedUser.isSuperAdmin()
    ) {
      return this.model
        .find()
        .skip(pagination.skip)
        .limit(pagination.limit)
        .sort({ createdAt: -1 })
        .lean();
    } else {
      return this.model
        .find({ organizationId: organizationId })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .sort({ createdAt: -1 })
        .lean();
    }
  }

  async findDistinctCities() {
    return this.model.distinct('city');
  }

  async findAll(user?: UserAuthInfo, isSuperAdmin = false) {
    if (isSuperAdmin) {
      return this.model.find();
    }
    const loggedUser = new User(user as unknown as User);
    const organizationId = loggedUser.organizationId;
    if (loggedUser.isSuperAdmin()) {
      // Super admins should see all screens
      return this.model.find();
    } else if (loggedUser.isAdmin() && organizationId) {
      // Admins with an organization should see screens within their organization
      return this.model.find({ organizationId: organizationId });
    } else {
      // Return an empty array for any other user
      return [];
    }
  }
}
