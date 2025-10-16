import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
  Patch,
  Query,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { ContactCreateRequestDto, ContactUpdateRequestDto } from './dto';
import { AuditEntity } from '@/audit/decorators/audit-log.decorator';
import type { RequestWithUser } from '~/interface';
import { AuthGuard } from '@nestjs/passport';
import { Response } from '@/utils/response.builder';

@Controller('/contact')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@AuditEntity('Contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/create')
  @ApiOperation({
    summary: 'Contact creation',
    description: 'Create a new contact',
  })
  @ApiBody({
    type: ContactCreateRequestDto,
    examples: {
      example: {
        value: {
          accountId: 'account-5678(enter valid one)',
          email: 'john.doe@example.com',
          phone: '+911234567890',
          firstName: 'John',
          lastName: 'Doe',
          title: 'Mr.',
        },
      },
    },
  })
  async createContact(
    @Body() contactCreateRequestDto: ContactCreateRequestDto,
    @Request() request: RequestWithUser,
  ): Promise<Response> {
    return await this.contactService.createContact(
      contactCreateRequestDto,
      request.user,
      request,
    );
  }

  @Get('/list/:accountId')
  @ApiOperation({
    summary: 'Get All Contacts By Account ID',
    description: 'Retrieve a list of all users',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async getAllContacts(
    @Param('accountId') accountId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<Response> {
    return this.contactService.getContacts(accountId, page, limit);
  }

  @Get('/:id/:accountId')
  async getContact(
    @Param('id') id: string,
    @Param('accountId') accountId: string,
  ): Promise<Response> {
    return this.contactService.getContactById(id, accountId);
  }

  @Patch('/:id')
  @ApiBody({
    type: ContactUpdateRequestDto,
    examples: {
      example: {
        value: {
          email: 'jane.doe@example.com',
          firstName: 'Jane',
          lastName: 'Doe',
          title: 'Ms.',
          phone: '+911234567890',
        },
      },
    },
  })
  async updateContact(
    @Param('id') id: string,
    @Request() request: RequestWithUser,
    @Body() contactUpdateRequestDto: ContactUpdateRequestDto,
  ): Promise<Response> {
    return this.contactService.updateContact(
      id,
      contactUpdateRequestDto,
      request.user,
      request,
    );
  }

  @Delete('delete/:contactId')
  async deleteContact(
    @Param('contactId') contactId: string,
    @Request() request: RequestWithUser,
  ): Promise<Response> {
    return await this.contactService.deleteContact(
      contactId,
      request.user,
      request,
    );
  }
}
