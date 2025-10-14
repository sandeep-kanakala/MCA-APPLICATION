import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRegisterRequest } from './dto/user.dto';
import type { Response } from '@/utils/response.builder';
import { UserService } from './user.service';
import { UserUpdateRequest } from './dto/user.dto';
import { ApiBearerAuth, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AccessToken } from '@/utils/AuthTokenUtils';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Role, Roles } from '@/auth/decorators/roles.decorator';

@Controller('user')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private readonly userService: UserService) { }

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Post('register')
  @ApiOperation({ summary: 'User Registration', description: 'Register a new user' })
  @ApiBody({
    type: UserRegisterRequest,
    examples: {
      example: {
        summary: 'User-I',
        value: {
          firstName: "John",
          middleName: "A",
          lastName: "Doe",
          phoneNo: "1234567890",
          email: "john@gmail.com",
          password: "john@1234",
          role: "USER"
        }
      }
    }
  })
  public async register(
    @Body() userRegisterRequest: UserRegisterRequest,
    @AccessToken() token: string,
  ): Promise<Response> {
    return this.userService.create(userRegisterRequest, token);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  @ApiOperation({ summary: 'Get All Users', description: 'Retrieve a list of all users' })
  public async getList(): Promise<Response> {
    return this.userService.getAll();
  }

  @HttpCode(HttpStatus.OK)
  @Get('id')
  @ApiOperation({ summary: 'Get User by ID', description: 'Retrieve user details by user ID' })
  public async getUser(@Query('id') id: string): Promise<Response> {
    return this.userService.getUserById(id);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('update')
  @ApiOperation({ summary: 'Update User', description: 'Update user details by user ID' })
  @ApiBody({
    type: UserUpdateRequest,
    examples: {
      example: {
        summary: 'User-I',
        value: {
          firstName: "John",
          middleName: "Addam",
          lastName: "Doe",
          phoneNo: "1234567890"
        }
      }
    }
  })
  public async update(
    @Query('id') id: string,
    @Body() userUpdateRequest: UserUpdateRequest,
    @AccessToken() token: string,
  ): Promise<Response> {
    return this.userService.update(id, userUpdateRequest, token);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('delete')
  @ApiOperation({ summary: 'Delete User', description: 'Delete user by user ID' })
  public async delete(
    @Query('id') id: string,
    @AccessToken() token: string,
  ): Promise<Response> {
    return this.userService.delete(id, token);
  }
}
