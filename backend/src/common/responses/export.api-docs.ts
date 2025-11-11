import { applyDecorators } from '@nestjs/common';
import { ApiQuery, ApiResponse } from '@nestjs/swagger';
import { commonErrorResponses } from '@/common/responses';
import { ExportEntity } from '@/modules/export/dto';

export function GetExportApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK - The export file was generated successfully.',
    }),
    ApiResponse({
      status: 400,
      description:
        'Bad Request - Invalid or missing parameters for export request.',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Missing or invalid authentication token.',
    }),
    ApiResponse({
      status: 404,
      description:
        'Not Found - No data available for the specified entity and filters.',
    }),
    ApiResponse({
      status: 500,
      description:
        'Internal Server Error - An unexpected error occurred during export.',
    }),
  );
}

export function GetExportApiQueries() {
  return applyDecorators(
    ApiQuery({
      name: 'entity',
      description: 'The name of the entity to export.',
      enum: ExportEntity,
    }),
    ApiQuery({
      name: 'format',
      description: 'The format of the exported file.',
      enum: ['CSV', 'XLSX'],
    }),
    ApiQuery({
      name: 'from',
      description: 'Start date for export (YYYY-MM-DD).',
      required: false,
      example: '2023-01-01',
    }),
    ApiQuery({
      name: 'to',
      description: 'End date for export (YYYY-MM-DD).',
      required: false,
      example: '2023-12-31',
    }),
    ApiQuery({
      name: 'isArchived',
      description:
        'True - Only Archived records will be exported. False - Only Active records will be exported.',
      required: false,
      type: Boolean,
      example: false,
    }),
    ApiQuery({
      name: 'min',
      description: 'Minimum number of records to export.',
      required: false,
      type: Number,
      example: 1,
      schema: { default: 1 },
    }),
    ApiQuery({
      name: 'max',
      description: 'Maximum number of records to export.',
      required: false,
      type: Number,
      example: 1000,
      schema: { default: 1000 },
    }),
  );
}
