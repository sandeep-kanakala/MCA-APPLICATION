import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { AssetService } from './asset.service';
import { CreateAssetDto, UpdateAssetDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '~/interface';
import type { Response } from '@/utils';
import { LoadEntityInterceptor } from '@/audit/interceptor/load-entity.interceptor';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import {
  ApiMethodDescription,
  AssetApiQueries,
  DeleteAssetApiResponses,
  GetAssetApiResponses,
  PatchAssetApiResponses,
  PatchAssetApiBody,
  PostAssetApiBody,
  PostAssetApiResponses,
  GetAssetByIdApiResponses,
} from '@/common/responses';
import { AuditEntity } from '@/audit/decorators/audit-log.decorator';
import { AssetsQueryDto } from '@/common';

@ApiTags('Assets')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@UseInterceptors(LoadEntityInterceptor)
@Controller('/assets')
@AuditEntity('Asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @PostAssetApiResponses()
  @ApiMethodDescription('Create new asset', 'create a new db record')
  @PostAssetApiBody()
  async create(
    @Body() createAssetDto: CreateAssetDto,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.assetService.createAsset(createAssetDto, request);
  }

  @Get()
  @ApiMethodDescription('List Assets with Filtering, Sorting, and Pagination')
  @GetAssetApiResponses()
  @AssetApiQueries()
  async findAssets(
    @Request() request: AuthenticatedRequest,
    @Query() query: AssetsQueryDto,
  ): Promise<Response> {
    return this.assetService.getAssets(
      request,
      query.page,
      query.limit,
      query.accountId,
      query.isArchived,
      query.status,
      query.fromDate,
      query.toDate,
      query.sortByField,
      query.sortOrder,
    );
  }

  @Get('/:assetId')
  @ApiMethodDescription('Get Asset by ID')
  @GetAssetByIdApiResponses()
  async findOne(
    @Param('assetId') assetId: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.assetService.getAssetById(assetId, request);
  }

  @Patch('/:assetId')
  @ApiMethodDescription('Update Asset by ID')
  @PatchAssetApiResponses()
  @PatchAssetApiBody()
  async update(
    @Param('assetId') assetId: string,
    @Body() updateAssetDto: UpdateAssetDto,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.assetService.updateAsset(assetId, updateAssetDto, request);
  }

  @Delete('/:assetId')
  @HttpCode(HttpStatus.OK)
  @DeleteAssetApiResponses()
  @ApiMethodDescription('Delete Asset by ID')
  async remove(
    @Param('assetId') assetId: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.assetService.deleteAsset(assetId, request);
  }
}
