import { AddressRepository } from '@/infrastructure/repositories/address.repository';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as winston from 'winston';
import { AddressUpdateRequestDto } from './dto';
import { AuthenticatedRequest } from '~/interface';
import { handleError, Response, ResponseBuilder } from '@/utils';
import { AddressCreateRequestDto } from './dto/address.create.dto';
import { AccountRepository } from '@/infrastructure/repositories/account.repository';

@Injectable()
export class AddressService {
  constructor(
    private readonly addressRepository: AddressRepository,
    private readonly accountRepository: AccountRepository,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: winston.Logger,
  ) {}

  async createAddress(
    request: AuthenticatedRequest,
    data: AddressCreateRequestDto,
  ): Promise<Response> {
    const { user } = request;

    try {
      const account = await this.accountRepository.findById(data.accountId);

      if (!account || account.tenantId !== user.tenantId) {
        throw new NotFoundException('Account not found or access denied');
      }

      const { accountId, ...addressData } = data;

      const createInput = {
        ...addressData,
        parent: { connect: { id: accountId } },
        createdBy: { connect: { id: user.id } },
      };

      const createdAddress =
        await this.addressRepository.createAddress(createInput);

      return new ResponseBuilder()
        .withStatusCode(201)
        .withMessage('Address created successfully')
        .withData(createdAddress)
        .build();
    } catch (error: unknown) {
      this.logger.error('Failed to create address', {
        error,
        userId: user.id,
        payload: data,
      });
      return handleError(error, 'Failed to create address');
    }
  }

  async getAddressById(
    id: string,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    try {
      const address = await this.addressRepository.findById(id);

      if (!address) {
        this.logger.warn(`Address not found: ${id}`);
        throw new NotFoundException('Address not found.');
      }

      return new ResponseBuilder()
        .withMessage('Address retrieved successfully.')
        .withData(address)
        .build();
    } catch (error: unknown) {
      this.logger.error(`Error retrieving address ID: ${id}`, { error });
      handleError(error, 'Error retrieving address.');
    }
  }

  async updateAddressService(
    id: string,
    request: AuthenticatedRequest,
    data: AddressUpdateRequestDto,
  ): Promise<Response> {
    try {
      const { user } = request;
      const existingAddress = await this.addressRepository.findById(id);

      if (!existingAddress) {
        this.logger.warn(`Address not found or already deleted: ${id}`);
        throw new NotFoundException('Address not found.');
      }
      const update = {
        ...data,
        updatedAt: new Date(),
        updatedById: user.id,
      };
      const result = await this.addressRepository.updateAddress(id, update);

      return new ResponseBuilder()
        .withStatusCode(201)
        .withMessage('Address updated successfully.')
        .withData(result)
        .build();
    } catch (error: unknown) {
      this.logger.error(`Error updating contact ID: ${id}`, { error });
      handleError(error, 'Error updating contact.');
    }
  }

  async findOne(id: string) {
    return await this.accountRepository.findById(id);
  }
}
