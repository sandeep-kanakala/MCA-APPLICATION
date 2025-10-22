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
} from '@nestjs/common';
import { BundleItemsService } from './bundle-items.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuditEntity } from '@/audit/decorators/audit-log.decorator';
import { AuthGuard } from '@nestjs/passport';
import { Request } from '@nestjs/common';
import {
  CreateBundleItemDto,
  UpdateBundleItemDto,
} from './dto/bundle-items.dto';
import type { RequestWithUser } from '~/interface';
import type { Response } from '@/utils/response.builder';
import { LoadEntityInterceptor } from '@/audit/interceptor/load-entity.interceptor';

@Controller('/bundle-items')
@UseInterceptors(LoadEntityInterceptor)
@ApiBearerAuth('access-token')
@ApiTags('Bundle Items')
@AuditEntity('BundleItem')
@UseGuards(AuthGuard('jwt'))
export class BundleItemsController {
  constructor(private readonly bundleItemsService: BundleItemsService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/:bundleId')
  async createBundleItem(
    @Param('bundleId') bundleId: string,
    @Body() dto: CreateBundleItemDto,
    @Request() request: RequestWithUser,
  ): Promise<Response> {
    return this.bundleItemsService.createBundleItem(bundleId, dto, request);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('/:id')
  public async updateBundleItem(
    @Param('id') id: string,
    @Body() dto: UpdateBundleItemDto,
    @Request() request: RequestWithUser,
  ): Promise<Response> {
    return this.bundleItemsService.updateBundleItem(id, dto, request);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('/:id')
  public async DeleteBundleItem(
    @Param('id') id: string,
    @Body() dto: UpdateBundleItemDto,
    @Request() request: RequestWithUser,
  ): Promise<Response> {
    return this.bundleItemsService.DeleteBundleItem(id, dto, request);
  }
}
