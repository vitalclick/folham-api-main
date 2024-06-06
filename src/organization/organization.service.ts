import { Injectable } from '@nestjs/common';
import { OrganizationRepository } from './organization.repository';
import { Types } from 'mongoose';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async createOrganization(organizationDto) {
    return this.organizationRepository.create(organizationDto);
  }

  async findOrganization(findQuery) {
    return this.organizationRepository.find(findQuery);
  }

  async findOneOrganization(query) {
    return this.organizationRepository.findOne(query);
  }

  async deleteOrganization(id: string) {
    return this.organizationRepository.delete({ _id: new Types.ObjectId(id) });
  }

  async updateOrganization(id, updateQuery) {
    return this.organizationRepository.updateOne(id, updateQuery);
  }
}
