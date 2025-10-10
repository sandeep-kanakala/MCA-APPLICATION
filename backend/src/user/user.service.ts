import {ConflictException, Injectable, NotFoundException} from '@nestjs/common';
import { UserRegisterRequest } from './payload/user.register.request';
import type { Response } from '@/common/response.interface';
import { ResponseBuilder } from '@/common/response.builder';
import { hashEmail } from '@/common/ResourceIdGenerator';
import { passwordEncoder } from '@/common/password.encoder';
import { PrismaService } from '@/prisma/prisma.service';
import { UserUpdateRequest } from './payload/user.update.request';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService,private readonly jwtService:JwtService) {}

  public async create(
    userRegisterRequest: UserRegisterRequest,
    token:string
  ): Promise<Response> {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: userRegisterRequest.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists!');
    }

    const decoded=this.jwtService.decode(token)
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
        createdBy:decoded.userName,
        tenant: {
        connect: { id: decoded.tenantId },
      }
      },
      select: {
          id: true,
          email: true,
          tenantId: true,
          createdAt: true
        }
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
    token:string
  ): Promise<Response> {
    const decoded=this.jwtService.decode(token)
    const updatedUser = await this.prismaService.user.update({
      where: { id: id },
      data:{...userUpdateRequest,updatedBy:decoded.userName}
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

  public async delete(id: string,token:string): Promise<Response> {
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
