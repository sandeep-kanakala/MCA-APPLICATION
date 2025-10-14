import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRegisterRequest } from './dto/user.dto';
import type { Response } from '@/utils/response.builder';
import { ResponseBuilder } from '@/utils/response.builder';
import { hashEmail } from '@/utils/ResourceIdGenerator';
import { passwordEncoder } from './util/password.encoder';
import { PrismaService } from '@/prisma/prisma.service';
import { UserUpdateRequest } from './dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import { UserStatus } from '@prisma/client';
import { Role } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  public async create(
    userRegisterRequest: UserRegisterRequest,
    token: string,
  ): Promise<Response> {
    const decoded = this.jwtService.decode(token);
    const existingUser = await this.prismaService.user.findFirst({
      where: {
        email: userRegisterRequest.email,
        tenantId: decoded.tenantId,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists!');
    }

    const id = hashEmail(userRegisterRequest.email);
    const password = await passwordEncoder.hashPassword(
      userRegisterRequest.password,
    );
    const data = await this.prismaService.user.create({
      data: {
        id: id,
        firstName: userRegisterRequest.firstName,
        middleName: userRegisterRequest.middleName,
        lastName: userRegisterRequest.lastName,
        phoneNo: userRegisterRequest.phoneNo,
        email: userRegisterRequest.email,
        password: password,
        createdBy: decoded.email,
        tenant: {
          connect: { id: decoded.tenantId },
        },
        role: userRegisterRequest.role as Role,
      },
      select: {
        id: true,
        email: true,
        tenantId: true,
        createdAt: true,
      },
    });

    return new ResponseBuilder()
      .withStatusCode(201)
      .withMessage('new user created!')
      .withData(data)
      .build();
  }

  public async update(
    id: string,
    userUpdateRequest: UserUpdateRequest,
    token: string,
  ): Promise<Response> {
    const decoded: any = this.jwtService.decode(token);

    const existingUser = await this.prismaService.user.findFirst({
      where: { id: id, status: UserStatus.ACTIVE },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found!');
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: id },
      data: { ...userUpdateRequest, updatedBy: decoded.userName },
    });

    return new ResponseBuilder().build();
  }

  public async getAll(): Promise<Response> {
    const usersData = await this.prismaService.user.findMany({
      where: { status: UserStatus.ACTIVE },
      select: {
        id: true,
        middleName: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNo: true,
        role: true,
      },
    });

    return new ResponseBuilder().withData(usersData).build();
  }

  public async getUserById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: id, status: UserStatus.ACTIVE },
      select: {
        middleName: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNo: true,
        role: true,
      },
    });

    if (user) {
      return new ResponseBuilder().withData(user).build();
    }
    throw new NotFoundException('User not found!');
  }

  public async delete(id: string, token: string): Promise<Response> {
    const decoded = this.jwtService.decode(token);
    const deletedUser = await this.prismaService.user.findFirst({
      where: { id: id, status:UserStatus.ACTIVE },
    });

    if (deletedUser) {
      const updated = await this.prismaService.user.update({
        where: { id: id},
        data: {
          deletedAt: new Date().toISOString(),
          status: UserStatus.INACTIVE,
          updatedBy: decoded.email,
        },
      });
      if (updated.status.startsWith('IN')) {
        return new ResponseBuilder().withMessage('USER DELETED').build();
      }
    }

    throw new NotFoundException('User not found!');
  }
}