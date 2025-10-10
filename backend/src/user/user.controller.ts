import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { UserRegisterRequest } from './payload/user.register.request';
import type { Response } from '@/common/response.interface';
import { UserService } from './user.service';
import { UserUpdateRequest } from './payload/user.update.request';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AccessToken } from '@/utils/AuthTokenUtils';

@Controller('user')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
export class UserController {


    constructor(private readonly userService:UserService){}

    @HttpCode(HttpStatus.CREATED)
    @Post("register")
    public async register(@Body() userRegisterRequest:UserRegisterRequest ,@AccessToken()token:string):Promise<Response>{
        return this.userService.create(userRegisterRequest,token);
    }

    @HttpCode(HttpStatus.OK)
    @Get()
    public async getList():Promise<Response>{
        return this.userService.getAll();
    }

    @HttpCode(HttpStatus.OK)
    @Get("id")
    public async getUser(@Query('id')id:string):Promise<Response>{
        return this.userService.getUserById(id);
    }


    @HttpCode(HttpStatus.OK)
    @Patch("update")
    public async update(@Query('id') id:string,@Body() userUpdateRequest:UserUpdateRequest, @AccessToken()token:string){
        return this.userService.update(id,userUpdateRequest,token);
    }

    @HttpCode(HttpStatus.OK)
    @Delete("delete")
    public async delete(@Query('id') id:string, @AccessToken()token:string){
        return this.userService.delete(id,token);
    }
}
