import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { Organization, OrganizationSchema } from './schema/organization.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationRepository } from './organization.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Organization.name,
        schema: OrganizationSchema,
      },
    ]),
  ],
  controllers: [OrganizationController],
  providers: [OrganizationRepository, OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
