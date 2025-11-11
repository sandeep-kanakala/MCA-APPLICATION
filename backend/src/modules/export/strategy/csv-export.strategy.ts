import { Injectable } from '@nestjs/common';
import { ExportStrategy } from './export-strategy.interface';
import { Parser } from 'json2csv';

@Injectable()
export class CsvExportStrategy implements ExportStrategy {
  async export(data: Record<string, unknown>[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const TypedParser = Parser as unknown as new <T>() => {
          parse(input: T[]): string;
        };

        const parser = new TypedParser<Record<string, unknown>>();

        const csv = parser.parse(data);

        resolve(Buffer.from(csv, 'utf-8'));
      } catch (err: unknown) {
        const message =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Unknown error';
        reject(new Error(`CSV export failed: ${message}`));
      }
    });
  }

  getContentType(): string {
    return 'text/csv';
  }
}
