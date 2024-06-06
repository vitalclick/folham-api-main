import { FilterQuery, Model, QueryOptions, Types, UpdateQuery } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { SocialNetworkDocument } from './schemas/social-network.schema';
import { PagingOptions } from '../activity-log/types/paging-options.types';

const searchProjection = {
  _id: 1,
  username: 1,
  firstName: 1,
  lastName: 1,
  profilePic: 1,
  type: 1,
};

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private model: Model<UserDocument>) {}

  async create(createUserDto): Promise<User> {
    let user;
    try {
      user = this.model.create(createUserDto);
    } catch (err) {
      console.log(err);
    }
    return user;
  }

  async find(
    findQuery: FilterQuery<UserDocument>,
    pagination: PagingOptions,
  ): Promise<User[]> {
    return this.model
      .find(findQuery)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean()
      .sort({ createdAt: -1 });
  }

  async findWithPagination(user, pagination: PagingOptions): Promise<User[]> {
    const organizationId = user.organizationId;
    if (user.privilege === 'admin' || user.privilege === 'superAdmin') {
      return this.model
        .find()
        .skip(pagination.skip)
        .limit(pagination.limit)
        .sort({ createdAt: -1 })
        .lean();
    } else {
      return this.model
        .find({ organizationId })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .sort({ createdAt: -1 })
        .lean();
    }
  }

  async findAll(
    findQuery?: FilterQuery<UserDocument>,
    option?: any,
    extra?: any,
  ): Promise<User[]> {
    return this.model.find(findQuery, option, extra).exec();
  }

  async findForFollows(query, populate?: any): Promise<User[] | undefined> {
    return this.model.find(query).populate(populate?.key, populate?.value);
  }

  async findOne(query, populate?: any): Promise<UserDocument> {
    return this.model
      .findOne(query)
      .populate(populate?.key, populate?.value)
      .lean();
  }

  async findById(userId: string): Promise<UserDocument> {
    return this.model.findById(userId);
  }

  async getUserData(payload: any): Promise<User | undefined> {
    return this.model.findOne(payload).select('+hash +salt').lean();
  }

  async saveUser(user: any): Promise<User> {
    return user.save();
  }

  public async updateSocialNetworks(
    id: string,
    updateQuery: UpdateQuery<SocialNetworkDocument>,
    option?: QueryOptions,
  ): Promise<User> {
    // Add object to array if social network name doesn't exist
    let result = await this.model.findOneAndUpdate(
      {
        _id: id,
        'socialNetworks.name': { $ne: updateQuery.socialNetworks.name },
      },
      { $addToSet: updateQuery },
      option,
    );
    if (!result) {
      // If social network exists, filter array by name and update url and visible
      result = await this.model.findOneAndUpdate(
        {
          _id: id,
        },
        {
          $set: {
            'socialNetworks.$[el].url': updateQuery.socialNetworks.url,
            'socialNetworks.$[el].visible': updateQuery.socialNetworks.visible,
          },
        },
        {
          arrayFilters: [{ 'el.name': updateQuery.socialNetworks.name }],
          new: true,
        },
      );
    }
    return result;
  }

  public async deleteSocialNetwork(
    id: string,
    updateQuery: UpdateQuery<SocialNetworkDocument>,
    option?: QueryOptions,
  ): Promise<User> {
    // remove object from array if social network array if name exist
    return this.model.findOneAndUpdate(
      {
        _id: id,
        'socialNetworks.name': { $eq: updateQuery.socialNetworks.name },
      },
      { $pull: updateQuery },
      option,
    );
  }

  public async findByIdAndUpdate(
    id,
    updateQuery: UpdateQuery<UserDocument>,
    option?: QueryOptions,
  ): Promise<UserDocument> {
    return this.model.findByIdAndUpdate(id, updateQuery, option);
  }

  public async search(
    query: string,
    limit: number,
    skip: number,
  ): Promise<User[]> {
    return this.model.aggregate([
      {
        $search: {
          index: 'searchUserIndex',
          compound: {
            must: [
              {
                exists: { path: 'firstName' },
              },
              {
                text: {
                  query,
                  path: ['firstName', 'lastName', 'username', 'email', 'type'],
                  fuzzy: {},
                },
              },
            ],
            filter: [
              {
                range: { path: 'userActiveStatus', lte: 0, gte: 0 },
              },
            ],
          },
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      { $project: searchProjection },
    ]);
  }

  async getOrganizationUsers(organizationId: string): Promise<UserDocument[]> {
    const users = await this.model.find({
      organizationId: new Types.ObjectId(organizationId),
    });
    return users;
  }

  async getAllSuperAdminEmails(): Promise<string[]> {
    const users = await this.model.find({ privilege: 'superAdmin' });
    return users.map((user) => user.email);
  }

  async getAllAdminEmailsInOrganization(
    organizationId: Types.ObjectId,
  ): Promise<string[]> {
    const users = await this.model.find({
      organizationId: organizationId,
      privilege: 'admin',
    });
    return users.map((user) => user.email);
  }
}
