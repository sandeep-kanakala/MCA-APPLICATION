import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ExportStrategy } from './strategy/export-strategy.interface';
import { CsvExportStrategy } from './strategy/csv-export.strategy';
import { ExcelExportStrategy } from './strategy/excel-export.strategy';
import { CSV, XLSX } from '@/config/constants';
import { buildPrismaWhereClause } from '@/utils/filter.builder';
import { exportFilterConfig } from './export.config';
import { PrismaDelegate } from '~/interface';
import { User } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as winston from 'winston';
import { handleError } from '@/utils';

@Injectable()
export class ExportService {
  private strategy: ExportStrategy;

  constructor(
    private readonly prisma: PrismaService,
    private readonly csvExportStrategy: CsvExportStrategy,
    private readonly excelExportStrategy: ExcelExportStrategy,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: winston.Logger,
  ) {}

  async export(
    entity: string,
    format: string,
    from?: string,
    to?: string,
    isArchived?: string,
    min?: number,
    max?: number,
  ) {
    this.logger.info(
      `Export service export called with entity: ${entity}, format: ${format}`,
    );
    try {
      if (min !== undefined && (min < 0 || !Number.isInteger(min))) {
        throw new BadRequestException(
          'Min limit must be a non-negative integer.',
        );
      }

      if (max !== undefined && (max < 0 || !Number.isInteger(max))) {
        throw new BadRequestException(
          'Max limit must be a non-negative integer.',
        );
      }

      if (max === 0) {
        throw new BadRequestException('Max limit cannot be 0.');
      }

      if (min !== undefined && max !== undefined && min > max) {
        throw new BadRequestException(
          'Min limit cannot be greater than max limit.',
        );
      }

      const where = buildPrismaWhereClause(exportFilterConfig, {
        from,
        to,
        isArchived,
      });

      const model = this.prisma[entity] as PrismaDelegate;

      if (!model) {
        throw new BadRequestException(`Entity ${entity} not found.`);
      }

      const totalCount = await model.count({ where });

      if (min && totalCount < min) {
        throw new BadRequestException(
          `Minimum of ${min} records not met. Found only ${totalCount}.`,
        );
      }

      let data = await model.findMany({
        where,
        take: max,
      });

      if (entity.toLowerCase() === 'user') {
        data = (data as User[]).map((user) => {
          const { password, otp, ...rest } = user;
          return rest;
        });
      }

      if (data.length === 0) {
        throw new NotFoundException(`No data found for ${entity}.`);
      }

      const strategy = this.getExportStrategy(format || XLSX);
      this.strategy = strategy;
      const buffer = await this.strategy.export(data);

      return {
        data: buffer,
        contentType: strategy.getContentType(),
        fileName: `${entity}.${format}`,
      };
    } catch (error) {
      const message = error instanceof Error ? error.stack : String(error);
      this.logger.error('Export service error', { message });
      handleError(error, 'Error during export');
    }
  }

  private getExportStrategy(format: string): ExportStrategy {
    if (format === CSV) {
      return this.csvExportStrategy;
    } else if (format === XLSX) {
      return this.excelExportStrategy;
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }
  }
}
