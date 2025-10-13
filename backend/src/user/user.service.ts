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
        role: userRegisterRequest.role,
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
    const decoded = this.jwtService.decode(token);
    const updatedUser = await this.prismaService.user.update({
      where: { id: id },
      data: { ...userUpdateRequest, updatedBy: decoded.userName },
    });
    if (updatedUser) {
      return new ResponseBuilder().build();
    }
    throw new NotFoundException('User not found!');
  }

  public async getAll(): Promise<Response> {
    const usersData = await this.prismaService.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        middleName: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNo: true,
      },
    });

    return new ResponseBuilder().withData(usersData).build();
  }

  public async getUserById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: id, deletedAt: null },
      select: {
        middleName: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNo: true,
      },
    });

    if (user) {
      return new ResponseBuilder().withData(user).build();
    }
    throw new NotFoundException('User not found!');
  }

  public async delete(id: string, token: string): Promise<Response> {
    const deletedUser = await this.prismaService.user.findFirst({
      where: { id: id, deletedAt: null },
    });

    if (deletedUser) {
      const updated = await this.prismaService.user.update({
        where: { id: id, deletedAt: null },
        data: { deletedAt: new Date().toISOString() },
      });
      if (updated.deletedAt != null) {
        return new ResponseBuilder().withMessage('USER DELETED').build();
      }
    }

    throw new NotFoundException('User not found!');
  }
}
