import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportDto } from './dto/export.dto';
import type { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  GetExportApiResponses,
  GetExportApiQueries,
  ApiMethodDescription,
} from '@/common/responses';

@ApiTags('Export')
@Controller('export')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get()
  @ApiMethodDescription(
    'Export data for a given entity',
    'Exports database records into a CSV or XLSX file with optional filters like date range, record limits, and archived status.',
  )
  @GetExportApiQueries()
  @GetExportApiResponses()
  async export(@Query() exportDto: ExportDto, @Res() res: Response) {
    const { entity, format, from, to, isArchived, min, max } = exportDto;
    const file = await this.exportService.export(
      entity,
      format,
      from,
      to,
      isArchived,
      min,
      max,
    );
    res.setHeader('Content-Type', file.contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${file.fileName}`,
    );
    res.send(file.data);
  }
}
