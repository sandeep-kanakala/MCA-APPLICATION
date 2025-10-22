import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { UserRegisterRequestDto, UserUpdateRequestDto } from './dto';
import { ResponseBuilder } from '@/utils/response.builder';
import { User, UserStatus } from '@prisma/client';
import type { Response } from '@/utils/response.builder';
import type { RequestWithUser } from '~/interface';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as winston from 'winston';
import { hashEmail, passwordEncoder } from '@/utils/helper';
import { UserRepository } from '@/infrastructure/repositories/user.repository';
import { cleanPatchData } from '@/utils';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: winston.Logger,
    private readonly userRepository: UserRepository,
  ) {}

  async create(
    userRegisterRequest: UserRegisterRequestDto,
    request: RequestWithUser,
  ): Promise<Response> {
    this.logger.info(
      `Creating the user for the tenant: ${userRegisterRequest.email}`,
    );
    try {
      const { user } = request;
      const { tenantId } = user;

      const existingUser = await this.prismaService.user.findFirst({
        where: {
          email: userRegisterRequest.email,
          tenantId,
        },
      });

      if (existingUser) {
        this.logger.error('Email already exists.');
        throw new ConflictException('Email already exists.');
      }

      const id = hashEmail(userRegisterRequest.email);
      const password = await passwordEncoder.hashPassword(
        userRegisterRequest.password,
      );

      const { password: _, ...newUser } = await this.userRepository.createUser({
        id,
        firstName: userRegisterRequest.firstName.trim(),
        middleName: userRegisterRequest.middleName?.trim() || null,
        lastName: userRegisterRequest.lastName.trim(),
        phoneNo: userRegisterRequest.phoneNo?.trim(),
        email: userRegisterRequest.email.toLowerCase().trim(),
        password,
        createdBy: user.email,
        tenant: { connect: { id: tenantId } },
        roles: {
          connect: [
            {
              tenantId_name: {
                tenantId: tenantId,
                name: userRegisterRequest.role,
              },
            },
          ],
        },
      });

      this.logger.info(
        `User created successfully: ${newUser.id} (${newUser.email})`,
      );

      return new ResponseBuilder()
        .withStatusCode(201)
        .withMessage('User created successfully.')
        .withData(newUser)
        .build();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Error creating user: ${userRegisterRequest.email}`, {
        error: message,
      });
      this.handleError(error, 'Error creating user');
    }
  }

  async update(
    id: string,
    userUpdateRequest: UserUpdateRequestDto,
    request: RequestWithUser,
  ): Promise<Response> {
    this.logger.info(`Updating the user details for the ${id}`);
    try {
      const { user } = request;

      const existingUser = await this.prismaService.user.findFirst({
        where: { id, status: UserStatus.ACTIVE },
      });

      if (!existingUser) {
        this.logger.warn(`user not found: ${id}`);
        throw new NotFoundException('User not found.');
      }
      const changes = cleanPatchData<User>(userUpdateRequest, existingUser);
      if (!changes.isChanged) {
        return new ResponseBuilder()
          .withStatusCode(204)
          .withMessage('no changes found')
          .withData(userUpdateRequest)
          .build();
      }

      const { password: _, ...updatedUser } =
        await this.prismaService.user.update({
          where: { id },
          data: {
            ...changes.cleaned,
            updatedBy: user.email,
            updatedAt: new Date(),
          },
        });

      this.logger.info(
        `User updated successfully: ${id} (${updatedUser.email})`,
      );
      return new ResponseBuilder()
        .withMessage('User updated successfully.')
        .withData(updatedUser)
        .build();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Error updating user ID: ${id}`, {
        error: message,
      });
      this.handleError(error, 'Error updating user');
    }
  }

  async getAll(page = 1, limit = 10): Promise<Response> {
    this.logger.info(`Fetching all users`);
    try {
      const pageNumber = Math.max(Number(page) || 1, 1);
      const pageSize = Math.max(Number(limit) || 10, 1);
      const skip = (pageNumber - 1) * pageSize;

      const [totalCount, users] = await Promise.all([
        this.prismaService.user.count({
          where: { status: UserStatus.ACTIVE },
        }),
        this.prismaService.user.findMany({
          where: { status: UserStatus.ACTIVE },
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
        }),
      ]);
      users.map(({ password, ...user }) => user);
      return new ResponseBuilder()
        .withMessage('Users fetched successfully.')
        .withData({
          total: totalCount,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(totalCount / pageSize),
          data: users,
        })
        .build();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error('Error fetching user list', { error: message });
      this.handleError(error, 'Error fetching user list');
    }
  }

  async getUserById(userId: string): Promise<Response> {
    this.logger.info(`Fetching user by ID: ${userId}`);
    try {
      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        this.logger.warn('Invalid user ID provided');
        throw new BadRequestException('Invalid user ID.');
      }

      const user = await this.userRepository.findActiveUserById(userId);

      if (!user || user.status !== UserStatus.ACTIVE) {
        this.logger.warn(`User not found or inactive: ${userId}`);
        throw new NotFoundException('User not found or inactive.');
      }
      const { password: _, ...cleanedUser } = user;
      this.logger.info(`User fetched successfully: ${userId} (${user.email})`);
      return new ResponseBuilder()
        .withMessage('User fetched successfully.')
        .withData(cleanedUser)
        .build();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Error fetching user by ID: ${userId}`, {
        error: message,
      });
      this.handleError(error, 'Error fetching user by ID');
    }
  }

  async delete(id: string, request: RequestWithUser): Promise<Response> {
    this.logger.info(`Delete user request received for ID: ${id}`);
    try {
      const { user } = request;

      const existinguser = await this.prismaService.user.findFirst({
        where: { id, status: UserStatus.ACTIVE },
      });

      if (!existinguser) {
        this.logger.warn(`Attempt to delete non-existent user: ${id}`);
        throw new NotFoundException('User not found.');
      }

      await this.prismaService.user.update({
        where: { id },
        data: {
          archivedAt: new Date().toISOString(),
          status: UserStatus.INACTIVE,
          updatedBy: user.email,
        },
      });

      this.logger.info(`User deleted successfully: ${id} (${user.email})`);
      return new ResponseBuilder()
        .withMessage('User deleted successfully.')
        .build();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Error deleting user ID: ${id}`, {
        error: message,
      });
      this.handleError(error, 'Error deleting user');
    }
  }

  async findOne(id: string) {
    const user = await this.userRepository.findActiveUserById(id);
    if (user) {
      const { password: _, ...safeUser } = user;
      return safeUser;
    }
  }

  private handleError(error: unknown, message: string): never {
    if (error instanceof BadRequestException) throw error;
    if (error instanceof ConflictException) throw error;
    if (error instanceof NotFoundException) throw error;

    throw new InternalServerErrorException(message || 'Internal server error.');
  }
}
