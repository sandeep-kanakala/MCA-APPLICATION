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
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { ContactCreateRequestDto, ContactUpdateRequestDto } from './dto';
import { AuditEntity } from '@/audit/decorators/audit-log.decorator';
import type { AuthenticatedRequest, RequestWithUser } from '~/interface';
import { AuthGuard } from '@nestjs/passport';
import { Response } from '@/utils/response.builder';
import { ApiCommonResponses } from '@/common';
import { LoadEntityInterceptor } from '@/audit/interceptor/load-entity.interceptor';

@ApiTags('Contact')
@Controller('/contacts')
@UseInterceptors(LoadEntityInterceptor)
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@AuditEntity('Contact')
@ApiCommonResponses()
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/create')
  @ApiOperation({
    summary: 'Contact creation',
    description: 'Create a new contact',
  })
  @ApiResponse({ status: 201, description: 'Contact created successfully.' })
  @ApiBody({ type: ContactCreateRequestDto })
  async createContact(
    @Body() contactCreateRequestDto: ContactCreateRequestDto,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return await this.contactService.createContact(
      contactCreateRequestDto,
      request,
    );
  }

  @Get('/list/')
  @ApiOperation({
    summary: 'Get All Contacts By Tenant ID',
    description: 'Retrieve a list of all users',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async getAllContacts(
    @Request() request: RequestWithUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<Response> {
    return this.contactService.getAllContactsByTenantId(request, page, limit);
  }

  @Get('/list/:accountId')
  @ApiOperation({
    summary: 'Get All Contacts By Account ID',
    description: 'Retrieve a list of all contacts for a given account',
  })
  @ApiResponse({ status: 200, description: 'Contacts retrieved successfully.' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async getAllContactsByAccountId(
    @Param('accountId') accountId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<Response> {
    return this.contactService.getContactsByAccountId(accountId, page, limit);
  }

  @Get('/:id/:accountId')
  @ApiOperation({
    summary: 'Get Contact by ID',
    description: 'Retrieve contact details by ID',
  })
  @ApiResponse({ status: 200, description: 'Contact retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Contact not found.' })
  async getContact(
    @Param('id') id: string,
    @Param('accountId') accountId: string,
  ): Promise<Response> {
    return this.contactService.getContactById(id, accountId);
  }

  @Patch('/:id')
  @ApiOperation({
    summary: 'Update Contact',
    description: 'Update contact details by ID',
  })
  @ApiResponse({ status: 200, description: 'Contact updated successfully.' })
  @ApiResponse({ status: 404, description: 'Contact not found.' })
  @ApiBody({ type: ContactUpdateRequestDto })
  async updateContact(
    @Param('id') id: string,
    @Request() request: AuthenticatedRequest,
    @Body() contactUpdateRequestDto: ContactUpdateRequestDto,
  ): Promise<Response> {
    return this.contactService.updateContact(
      id,
      contactUpdateRequestDto,
      request,
    );
  }

  @Delete('delete/:contactId')
  @ApiOperation({
    summary: 'Delete Contact',
    description: 'Delete contact by ID',
  })
  @ApiResponse({ status: 200, description: 'Contact deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Contact not found.' })
  async deleteContact(
    @Param('contactId') contactId: string,
    @Request() request: RequestWithUser,
  ): Promise<Response> {
    return await this.contactService.deleteContact(contactId, request);
  }
}
