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
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { ContactCreateRequestDto, ContactUpdateRequestDto } from './dto';
import { AuditEntity } from '@/audit/decorators/audit-log.decorator';
import type { AuthenticatedRequest, RequestWithUser } from '~/interface';
import { AuthGuard } from '@nestjs/passport';
import { Response } from '@/utils/response.builder';

@ApiTags('Contact')
@Controller('/contact')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@AuditEntity('Contact')
@ApiResponse({
  status: 400,
  description: 'The request is malformed or invalid.',
})
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({
  status: 403,
  description:
    'The user does not have the necessary privileges to perform the operation.',
})
@ApiResponse({ status: 500, description: 'An internal server error occurred.' })
@ApiResponse({ status: 503, description: 'A service is unreachable.' })
@ApiResponse({ status: 504, description: 'Gateway Timeout Error.' })
@ApiResponse({ status: 200, description: 'OK' })
@ApiResponse({ status: 202, description: 'Accepted' })
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
    @Request() request: RequestWithUser,
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
