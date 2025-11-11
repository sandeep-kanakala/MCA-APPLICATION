import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { CsvExportStrategy } from './strategy/csv-export.strategy';
import { ExcelExportStrategy } from './strategy/excel-export.strategy';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExportController],
  providers: [ExportService, CsvExportStrategy, ExcelExportStrategy],
})
export class ExportModule {}
