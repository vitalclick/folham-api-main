import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AuthUser } from '../common/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('organization')
@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Creates a new organization',
    type: CreateOrganizationDto,
  })
  async createOrganization(
    @AuthUser() user,
    @Body() organizationDto: CreateOrganizationDto,
  ) {
    if (!['admin', 'superAdmin'].includes(user.privilege)) {
      throw new NotFoundException('Only admin can create an organization');
    }
    return this.organizationService.createOrganization(organizationDto);
  }

  @Get('findAll')
  @ApiOkResponse({
    description: 'Finds all organizations',
  })
  async findOrganization(findQuery) {
    return this.organizationService.findOrganization(findQuery);
  }

  @Put('update/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Updates an organization',
    type: CreateOrganizationDto,
  })
  async updateOrganization(
    @Param('id') id,
    @Body() updateQuery: UpdateOrganizationDto,
  ) {
    return this.organizationService.updateOrganization(id, updateQuery);
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Deletes an organization',
    type: CreateOrganizationDto,
  })
  async deleteOrganization(@AuthUser() user, @Param('id') id: string) {
    if (user.privilege !== 'admin' || user.privilege !== 'superAdmin')
      throw new NotFoundException(
        'Only admin can delete this organization,you are not a part of this organization',
      );
    return this.organizationService.deleteOrganization(id);
  }
}
