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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { ContactCreateRequestDto, ContactUpdateRequestDto } from './dto';
import { AuditEntity } from '@/audit/decorators/audit-log.decorator';
import type { AuthenticatedRequest, RequestWithUser } from '~/interface';
import { AuthGuard } from '@nestjs/passport';
import { Response } from '@/utils/response.builder';
import { LoadEntityInterceptor } from '@/audit/interceptor/load-entity.interceptor';
import {
  ApiMethodDescription,
  ContactApiQueries,
  DeleteContactApiResponses,
  GetContactApiResponses,
  PatchContactApiBody,
  PatchContactApiResponses,
  PostContactApiBody,
  PostContactApiResponses,
} from '@/common/responses';
import { ContactsQueryDto } from '@/common';
import { toBoolean } from '@/utils';

@ApiTags('Contact')
@Controller('/contacts')
@UseInterceptors(LoadEntityInterceptor)
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@AuditEntity('Contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiMethodDescription('create a new contact')
  @PostContactApiResponses()
  @PostContactApiBody()
  async createContact(
    @Body() contactCreateRequestDto: ContactCreateRequestDto,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return await this.contactService.createContact(
      contactCreateRequestDto,
      request,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  @ApiMethodDescription('Fetches all contacts')
  @GetContactApiResponses()
  @ContactApiQueries()
  async getAllContactsByAccountId(
    @Request() request: AuthenticatedRequest,
    @Query() query: ContactsQueryDto,
  ): Promise<Response> {
    return await this.contactService.getAllContactsByAccountId(
      request,
      query.page,
      query.limit,
      query.accountId,
      toBoolean(query.isArchived),
      query.sortByField,
      query.search,
      query.fromDate,
      query.toDate,
      query.sortOrder,
    );
  }

  @Get('/:contactId')
  @ApiMethodDescription('Get Contact by ID')
  @GetContactApiResponses()
  async getContact(@Param('contactId') contactId: string): Promise<Response> {
    return this.contactService.getContactById(contactId);
  }

  @Patch('/:contactId')
  @ApiMethodDescription('Update contact by ID')
  @PatchContactApiResponses()
  @PatchContactApiBody()
  async updateContact(
    @Param('contactId') id: string,
    @Request() request: AuthenticatedRequest,
    @Body() contactUpdateRequestDto: ContactUpdateRequestDto,
  ): Promise<Response> {
    return this.contactService.updateContact(
      id,
      contactUpdateRequestDto,
      request,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Delete('/:contactId')
  @ApiMethodDescription('Delete Contact by ID')
  @DeleteContactApiResponses()
  async deleteContact(
    @Param('contactId') contactId: string,
    @Request() request: RequestWithUser,
  ): Promise<Response> {
    return await this.contactService.deleteContact(contactId, request);
  }
}
