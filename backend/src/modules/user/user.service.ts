import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Inject,
  ForbiddenException,
} from '@nestjs/common';
import { UserRegisterRequestDto, UserUpdateRequestDto } from './dto';
import { ResponseBuilder } from '@/utils/response.builder';
import { Prisma, User } from '@prisma/client';
import type { Response } from '@/utils/response.builder';
import type {
  AuthenticatedRequest,
  UserWithoutSensitive,
  UserWithRole,
} from '~/interface';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as winston from 'winston';
import { hash, passwordEncoder } from '@/utils/helper';
import { UserRepository } from '@/infrastructure/repositories/user.repository';
import { cleanPatchData, handleError } from '@/utils';
import { AllowedUerSortFields } from '@/config/constants/user.constants';
import { ASC, CREATED_AT, DESC, SUPER_ADMIN } from '@/config/constants';

@Injectable()
export class UserService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: winston.Logger,
    private readonly userRepository: UserRepository,
  ) {}

  async create(
    userRegisterRequest: UserRegisterRequestDto,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    this.logger.info(
      `Creating the user for the tenant: ${userRegisterRequest.email}`,
    );
    try {
      const { user } = request;
      const { tenantId } = user;
      const where: Prisma.UserWhereInput = {
        roles: {
          some: {
            name: SUPER_ADMIN,
          },
        },
        isArchived: false,
      };
      const existingSuperAdmin = await this.userRepository.findUser(where);

      if (userRegisterRequest.role === SUPER_ADMIN && existingSuperAdmin) {
        this.logger.error('A super admin already exists.');
        throw new ConflictException(
          'A super admin already exists in the system.',
        );
      }

      const { email, password, role, ...data } = userRegisterRequest;
      const cleanedEmail = email.trim().toLocaleLowerCase();
      const id = hash(cleanedEmail);
      const existingUser = await this.userRepository.findUser({ id });
      if (existingUser) {
        this.logger.error(`Email already exists: ${cleanedEmail}`);
        if (!existingUser.isArchived) {
          throw new ConflictException('Email already exists.');
        }
        throw new ConflictException(
          'This email is associated with a deactivated account.',
        );
      }

      const hashedPassword = await passwordEncoder.hashPassword(password);
      const include: Prisma.UserInclude = {
        roles: {
          select: {
            name: true,
          },
        },
      };
      const {
        password: _,
        otp: __,
        ...newUser
      } = await this.userRepository.createUser(
        {
          id,
          ...data,
          email: cleanedEmail,
          password: hashedPassword,
          createdByUser: {
            connect: {
              id: user.id,
            },
          },
          tenant: { connect: { id: tenantId } },
          roles: {
            connect: [
              {
                tenantId_name: {
                  tenantId: tenantId,
                  name: role,
                },
              },
            ],
          },
        },
        include,
      );

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
      handleError(error, 'Error creating user');
    }
  }

  async getAll(
    page = 1,
    limit = 10,
    search?: string,
    fromDate?: Date,
    toDate?: Date,
    role?: string,
    sortByField?: string,
    sortOrder?: string,
    isArchived: boolean = false,
  ): Promise<Response> {
    this.logger.info(`Fetching all users`);
    try {
      const pageNumber = Math.max(Number(page) || 1, 1);
      const pageSize = Math.max(Number(limit) || 10, 1);
      const skip = (pageNumber - 1) * pageSize;
      const cleanSearch = typeof search === 'string' ? search.trim() : search;
      const cleanRole = typeof role === 'string' ? role.trim() : role;
      const cleanSortOrder =
        typeof sortOrder === 'string' ? sortOrder.trim() : sortOrder;
      const searchCondition: Prisma.UserWhereInput =
        this.buildWhereAndFilterClauses(
          cleanSearch,
          cleanRole,
          fromDate,
          toDate,
        );
      const sortField = AllowedUerSortFields.includes(sortByField as string)
        ? sortByField
        : CREATED_AT;
      const order = cleanSortOrder?.toLowerCase() === ASC ? ASC : DESC;
      const where: Prisma.UserWhereInput = {
        isArchived,
        roles: {
          none: { name: SUPER_ADMIN },
        },
        ...searchCondition,
      };
      const include: Prisma.UserInclude = {
        roles: {
          select: {
            name: true,
          },
        },
      };
      const [totalCount, users] = await Promise.all([
        this.userRepository.count(where),
        this.userRepository.getAllUsers(where, include, skip, pageSize, {
          [sortField as string]: order,
        }),
      ]);
      const cleanedUsers = users.map(
        ({ password: _, otp: __, ...user }) => user,
      );
      return new ResponseBuilder()
        .withMessage('Users fetched successfully.')
        .withData({
          total: totalCount,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(totalCount / pageSize),
          data: cleanedUsers,
        })
        .build();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error('Error fetching user list', { error: message });
      handleError(error, 'Error fetching user list');
    }
  }

  async getUserById(id: string): Promise<Response> {
    this.logger.info(`Fetching user by ID: ${id}`);
    try {
      if (!id || typeof id !== 'string' || id.trim() === '') {
        this.logger.warn('Invalid user ID provided');
        throw new BadRequestException('Invalid user ID.');
      }
      const include: Prisma.UserInclude = {
        roles: {
          select: {
            name: true,
          },
        },
      };

      const user = await this.userRepository.findUser(
        { id, isArchived: false },
        include,
      );

      if (!user) {
        this.logger.warn(`User not found or inactive: ${id}`);
        throw new NotFoundException('User not found or inactive.');
      }
      const { password: _, otp: __, ...cleanedUser } = user;
      this.logger.info(`User fetched successfully: ${id} (${user.email})`);
      return new ResponseBuilder()
        .withMessage('User fetched successfully.')
        .withData(cleanedUser)
        .build();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Error fetching user by ID: ${id}`, {
        error: message,
      });
      handleError(error, 'Error fetching user by ID');
    }
  }

  async update(
    id: string,
    userUpdateRequest: UserUpdateRequestDto,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    this.logger.info(`Updating the user details for the ${id}`);
    try {
      const { user } = request;

      const existingUser = await this.userRepository.findUser({
        id,
        isArchived: false,
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
      const include: Prisma.UserInclude = {
        roles: {
          select: {
            name: true,
          },
        },
      };
      const updateData: Prisma.UserUpdateInput = {
        ...changes.cleaned,
        updatedByUser: {
          connect: {
            id: user.id,
          },
        },
      };

      const isUpdated = await this.userRepository.updateUserById(
        id,
        updateData,
        include,
      );
      if (!isUpdated) {
        throw new Error('failed to update user');
      }
      const { password: _, otp: __, ...updatedUser } = isUpdated;
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
      handleError(error, 'Error updating user');
    }
  }

  async delete(id: string, request: AuthenticatedRequest): Promise<Response> {
    this.logger.info(`Delete user request received for ID: ${id}`);
    try {
      const { user } = request;
      const include: Prisma.UserInclude = {
        roles: {
          select: {
            name: true,
          },
        },
      };
      const existingUser: UserWithRole = (await this.userRepository.findUser(
        { id, tenantId: user.tenantId, isArchived: false },
        include,
      )) as UserWithRole;

      this.logger.warn(`Attempt to delete non-existent user: ${id}`);
      if (!existingUser) {
        throw new NotFoundException('User not found.');
      }
      const isSuperAdmin = existingUser.roles.some(
        (role) => role.name === SUPER_ADMIN,
      );

      if (isSuperAdmin) {
        this.logger.warn(`Attempt to delete super-admin user: ${id}`);
        throw new ForbiddenException('Cannot delete super-admin user.');
      }

      const deleteData = {
        archivedAt: new Date().toISOString(),
        isArchived: true,
        updatedBy: user.id,
      };
      const deletedUser = await this.userRepository.archiveUser(
        { id },
        deleteData,
      );
      if (!deletedUser) {
        throw new Error('Unable to delete user');
      }

      this.logger.info(
        `User deleted successfully: ${id} (${deletedUser.email})`,
      );
      return new ResponseBuilder()
        .withStatusCode(204)
        .withMessage('User deleted successfully.')
        .build();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Error deleting user ID: ${id}`, {
        error: message,
      });
      handleError(error, 'Error deleting user');
    }
  }

  async findOne(id: string): Promise<UserWithoutSensitive | undefined> {
    const include: Prisma.UserInclude = {
      roles: {
        select: {
          name: true,
        },
      },
    };
    const user = await this.userRepository.findUser({ id }, include);
    if (user) {
      const { password: _, otp: __, ...safeUser } = user;
      return safeUser;
    }
  }

  private buildWhereAndFilterClauses(
    cleanSearch?: string,
    cleanRole?: string,
    cleanFromDate?: Date,
    cleanToDate?: Date,
  ): Prisma.UserWhereInput {
    const searchCondition: Prisma.UserWhereInput = cleanSearch
      ? {
          OR: [
            {
              firstName: {
                contains: cleanSearch,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              middleName: {
                contains: cleanSearch,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              lastName: {
                contains: cleanSearch,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              email: {
                contains: cleanSearch,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              phoneNo: {
                contains: cleanSearch,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }
      : {};

    const filters: Prisma.UserWhereInput = {
      ...(cleanRole && {
        roles: {
          some: {
            name: {
              contains: cleanRole,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        },
      }),
      ...(cleanFromDate && {
        createdAt: {
          gte: cleanFromDate,
        },
      }),
      ...(cleanToDate && {
        createdAt: {
          ...(cleanFromDate ? { gte: cleanFromDate } : {}),
          lte: new Date(
            cleanToDate.setDate(new Date(cleanToDate).getDate() + 1),
          ),
        },
      }),
    };

    return {
      AND: [searchCondition, filters],
    };
  }
}
