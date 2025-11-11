import { Injectable } from '@nestjs/common';
import { ExportStrategy } from './export-strategy.interface';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelExportStrategy implements ExportStrategy {
  async export(data: Record<string, unknown>[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      worksheet.columns = headers.map((header) => ({
        header,
        key: header,
        width: 20,
      }));
      worksheet.addRows(data);

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000FF' }, // Blue
        };
      });
    }

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  getContentType(): string {
    return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  }
}
