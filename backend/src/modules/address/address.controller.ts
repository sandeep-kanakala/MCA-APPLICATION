import {
  Controller,
  Body,
  Request,
  UseGuards,
  Patch,
  Param,
  Get,
  UseInterceptors,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuditEntity } from '@/audit/decorators/audit-log.decorator';
import type { AuthenticatedRequest } from '~/interface';
import { AuthGuard } from '@nestjs/passport';
import { Response } from '@/utils/response.builder';
import { LoadEntityInterceptor } from '@/audit/interceptor/load-entity.interceptor';
import { ApiMethodDescription } from '@/common/responses';
import { AddressService } from './address.service';
import {
  GetAddressApiResponse,
  PatchAddressApiBody,
  PatchAddressApiResponses,
  PostAddressApiResponses,
  PostAddressApiBody,
} from '@/common/responses/address.api-docs';
import { AddressUpdateRequestDto, AddressCreateRequestDto } from './dto';

@ApiTags('Address')
@Controller('/address')
@UseInterceptors(LoadEntityInterceptor)
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@AuditEntity('Address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @ApiMethodDescription('Create new address')
  @PostAddressApiResponses()
  @PostAddressApiBody()
  createAddress(
    @Request() request: AuthenticatedRequest,
    @Body() addressCreateRequestDto: AddressCreateRequestDto,
  ): Promise<Response> {
    return this.addressService.createAddress(request, addressCreateRequestDto);
  }

  @Get('/:addressId')
  @ApiMethodDescription('Get address by ID')
  @GetAddressApiResponse()
  async getAddressById(
    @Param('addressId') id: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.addressService.getAddressById(id, request);
  }

  @Patch('/:addressId')
  @ApiMethodDescription('Update address by ID')
  @PatchAddressApiResponses()
  @PatchAddressApiBody()
  async updateAddress(
    @Param('addressId') id: string,
    @Request() request: AuthenticatedRequest,
    @Body() addressUpdateRequestDto: AddressUpdateRequestDto,
  ): Promise<Response> {
    return this.addressService.updateAddressService(
      id,
      request,
      addressUpdateRequestDto,
    );
  }
}
