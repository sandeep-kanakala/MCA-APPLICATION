import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserRegisterRequestDto, UserUpdateRequestDto } from './dto/user.dto';
import { ResponseBuilder } from '@/utils/response.builder';
import { hashEmail } from '@/utils/ResourceIdGenerator';
import { passwordEncoder } from './util/password.encoder';
import { IUserTokenPayload } from '~/interface/userToken.interface';
import { UserStatus, Role } from '@prisma/client';
import type { Response } from '@/utils/response.builder';
import type { AuditRequest } from '@/common/types/express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as winston from 'winston';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: winston.Logger,
  ) {}

  async create(
    userRegisterRequest: UserRegisterRequestDto,
    token: string,
    req: AuditRequest,
  ): Promise<Response> {
    this.logger.info(`Creating the user for the tenant: ${userRegisterRequest.email}`);
    try {
      const decoded = this.decodeToken(token);

      const existingUser = await this.prismaService.user.findFirst({
        where: {
          email: userRegisterRequest.email,
          tenantId: decoded.tenantId,
        },
      });

      if (existingUser) {
        this.logger.error("Email already exists.");
        throw new ConflictException('Email already exists.');
      }

      const id = hashEmail(userRegisterRequest.email);
      const password = await passwordEncoder.hashPassword(
        userRegisterRequest.password,
      );

      const newUser = await this.prismaService.user.create({
        data: {
          id,
          firstName: userRegisterRequest.firstName.trim(),
          middleName: userRegisterRequest.middleName?.trim() || null,
          lastName: userRegisterRequest.lastName.trim(),
          phoneNo: userRegisterRequest.phoneNo?.trim(),
          email: userRegisterRequest.email.toLowerCase().trim(),
          password,
          createdBy: decoded.email,
          tenant: { connect: { id: decoded.tenantId } },
          role: userRegisterRequest.role as Role,
        },
        select: { id: true, email: true, tenantId: true, createdAt: true },
      });

      req.afterUpdate = newUser;
      this.logger.info(`User created successfully: ${newUser.id} (${newUser.email})`);

      return new ResponseBuilder()
        .withStatusCode(201)
        .withMessage('User created successfully.')
        .withData(newUser)
        .build();
    } catch (error) {
      this.logger.error(`Error creating user: ${userRegisterRequest.email}`, { error: error.message });
      this.handleError(error, 'Error creating user');
    }
  }

  async update(
    id: string,
    userUpdateRequest: UserUpdateRequestDto,
    token: string,
    req: AuditRequest,
  ): Promise<Response> {
     this.logger.info(`Updating the user details for the ${id}`);
    try {
      const decoded = this.decodeToken(token);

      const existingUser = await this.prismaService.user.findFirst({
        where: { id, status: UserStatus.ACTIVE },
      });

      if (!existingUser) {
        this.logger.warn(`user not found: ${id}`);
        throw new NotFoundException('User not found.');
      }

      req.beforeUpdate = existingUser;

      const updatedUser = await this.prismaService.user.update({
        where: { id },
        data: {
          ...userUpdateRequest,
          updatedBy: decoded.email,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNo: true,
          role: true,
          updatedAt: true,
        },
      });

      req.afterUpdate = updatedUser;
      this.logger.info(`User updated successfully: ${id} (${updatedUser.email})`);
      return new ResponseBuilder()
        .withMessage('User updated successfully.')
        .withData(updatedUser)
        .build();
    } catch (error) {
      this.logger.error(`Error updating user ID: ${id}`, { error: error.message });
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
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
            phoneNo: true,
            role: true,
          },
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

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
    } catch (error) {
      this.logger.error('Error fetching user list', { error: error.message });
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

      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          email: true,
          phoneNo: true,
          role: true,
          status: true,
        },
      });

      if (!user || user.status !== UserStatus.ACTIVE) {
        this.logger.warn(`User not found or inactive: ${userId}`);
        throw new NotFoundException('User not found or inactive.');
      }
      this.logger.info(`User fetched successfully: ${userId} (${user.email})`);
      return new ResponseBuilder()
        .withMessage('User fetched successfully.')
        .withData(user)
        .build();
    } catch (error) {
      this.logger.error(`Error fetching user by ID: ${userId}`, { error: error.message });
      this.handleError(error, 'Error fetching user by ID');
    }
  }

  async delete(
    id: string,
    token: string,
    req: AuditRequest,
  ): Promise<Response> {
    this.logger.info(`Delete user request received for ID: ${id}`);
    try {
      const decoded = this.decodeToken(token);

      const user = await this.prismaService.user.findFirst({
        where: { id, status: UserStatus.ACTIVE },
      });

      if (!user) {
        this.logger.warn(`Attempt to delete non-existent user: ${id}`);
        throw new NotFoundException('User not found.');
      }

      await this.prismaService.user.update({
        where: { id },
        data: {
          archivedAt: new Date().toISOString(),
          status: UserStatus.INACTIVE,
          updatedBy: decoded.email,
        },
      });

      req.beforeUpdate = user;
      this.logger.info(`User deleted successfully: ${id} (${user.email})`);
      return new ResponseBuilder()
        .withMessage('User deleted successfully.')
        .build();
    } catch (error) {
      this.logger.error(`Error deleting user ID: ${id}`, { error: error.message });
      this.handleError(error, 'Error deleting user');
    }
  }

  private decodeToken(token: string): IUserTokenPayload {
    const decoded: IUserTokenPayload = this.jwtService.decode(token);
    if (!decoded || !decoded.email) {
      throw new BadRequestException('Invalid or expired token.');
    }
    return decoded;
  }

  private handleError(error: unknown, message: string): never {
    if (error instanceof BadRequestException) throw error;
    if (error instanceof ConflictException) throw error;
    if (error instanceof NotFoundException) throw error;

    throw new InternalServerErrorException('Internal server error.');
  }
}
