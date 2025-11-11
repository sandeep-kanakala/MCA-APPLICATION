import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
  Patch,
  Delete,
  UseInterceptors,
  Get,
  Request,
} from '@nestjs/common';
import { BundleItemsService } from './bundle-items.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import {
  CreateBundleItemDto,
  UpdateBundleItemDto,
} from './dto/bundle-items.dto';
import type { RequestWithUser } from '~/interface';
import type { Response } from '@/utils/response.builder';
import { LoadEntityInterceptor } from '@/audit/interceptor/load-entity.interceptor';
import { ApiMethodDescription } from '@/common/responses';
import {
  DeleteBundleItemApiResponses,
  GetBundleItemApiResponses,
  PatchBundleItemApiBody,
  PatchBundleItemApiResponses,
  PostBundleItemApiBody,
  PostBundleItemApiResponses,
} from '@/common/responses/bundle-items.api-docs';
import { AuditEntity } from '@/audit/decorators/audit-log.decorator';

@Controller('/bundle-items')
@UseInterceptors(LoadEntityInterceptor)
@ApiBearerAuth('access-token')
@ApiTags('Bundle Items')
@UseGuards(AuthGuard('jwt'))
@AuditEntity('ProductBundleItem')
export class BundleItemsController {
  constructor(private readonly bundleItemsService: BundleItemsService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/:bundleId')
  @ApiMethodDescription(' Creates new bundle item')
  @PostBundleItemApiResponses()
  @PostBundleItemApiBody()
  async createBundleItem(
    @Param('bundleId') bundleId: string,
    @Body() dto: CreateBundleItemDto,
    @Request() request: RequestWithUser,
  ): Promise<Response> {
    return this.bundleItemsService.createBundleItem(bundleId, dto, request);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('/:bundleItemId')
  @ApiMethodDescription('Update bundle item by ID')
  @PatchBundleItemApiResponses()
  @PatchBundleItemApiBody()
  public async updateBundleItem(
    @Param('bundleItemId') bundleItemId: string,
    @Body() dto: UpdateBundleItemDto,
    @Request() request: RequestWithUser,
  ): Promise<Response> {
    return this.bundleItemsService.updateBundleItem(bundleItemId, dto, request);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/:bundleItemId')
  @ApiMethodDescription('Get bundle item by ID')
  @GetBundleItemApiResponses()
  public async getBundleItem(
    @Param('bundleItemId') bundleItemId: string,
    @Request() request: RequestWithUser,
  ): Promise<Response> {
    return this.bundleItemsService.getBundleItem(bundleItemId, request);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('/:bundleItemId')
  @ApiMethodDescription('Delete bundle item by ID')
  @DeleteBundleItemApiResponses()
  public async DeleteBundleItem(
    @Param('bundleItemId') bundleItemId: string,
    @Request() request: RequestWithUser,
  ): Promise<Response> {
    return this.bundleItemsService.DeleteBundleItem(bundleItemId, request);
  }
}
