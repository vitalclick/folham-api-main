import { Injectable } from '@nestjs/common';
import { FilterQuery, Model, QueryOptions, UpdateQuery } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Widgets, WidgetsDocument } from './schema/widgets.schema';
import { Types } from 'mongoose';

@Injectable()
export class WidgetsRepository {
  constructor(
    @InjectModel(Widgets.name)
    private model: Model<WidgetsDocument>,
  ) {}

  async create(createWidgetDto): Promise<WidgetsDocument> {
    let widget;
    try {
      widget = this.model.create(createWidgetDto);
    } catch (err) {
      console.log(err);
    }
    return widget;
  }

  async find(): Promise<WidgetsDocument[]> {
    return this.model.find().exec();
  }

  async findAll(
    findQuery?: FilterQuery<WidgetsDocument>,
    option?: any,
    extra?: any,
  ): Promise<WidgetsDocument[]> {
    return this.model.find(findQuery, option, extra).exec();
  }

  async findOne(
    query: FilterQuery<WidgetsDocument>,
    populate?: any,
  ): Promise<WidgetsDocument> {
    return this.model
      .findOne(query)
      .populate(populate?.key, populate?.value)
      .lean();
  }

  async findById(
    query: FilterQuery<WidgetsDocument>,
  ): Promise<WidgetsDocument | undefined> {
    return this.model.findById(query).exec();
  }

  async saveWidget(widget: any): Promise<WidgetsDocument> {
    return widget.save();
  }

  public async findByIdAndUpdate(
    id: Types.ObjectId,
    updateQuery: UpdateQuery<WidgetsDocument>,
    option?: QueryOptions,
  ): Promise<WidgetsDocument> {
    return this.model.findByIdAndUpdate(id, updateQuery, option);
  }

  public async delete(query: FilterQuery<WidgetsDocument>) {
    return this.model.findOneAndDelete(query);
  }
}
