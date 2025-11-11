import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { extractRelationFromMessage, formatEntityName } from './helper';

export function handleError(error: unknown, message?: string): never {
  if (error instanceof BadRequestException) throw error;
  if (error instanceof ConflictException) throw error;
  if (error instanceof NotFoundException) throw error;
  if (error instanceof UnauthorizedException) throw error;
  if (error instanceof ForbiddenException) throw error;
  if (error instanceof Error) {
    throw new InternalServerErrorException(error.message);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === 'P2002') {
      throw new ConflictException('Duplicate record detected.');
    }

    // Foreign key constraint failed
    if (error.code === 'P2003') {
      const relation =
        (error.meta?.field_name as string) ||
        extractRelationFromMessage(error.message);

      throw new BadRequestException(
        relation
          ? `${formatEntityName(relation)} reference is invalid.`
          : 'Invalid foreign key reference.',
      );
    }

    // Record not found (for relations)
    if (error.code === 'P2025') {
      const entity = extractRelationFromMessage(error.message);

      const errorMessage = entity
        ? `${formatEntityName(entity)} record not found.`
        : 'Record not found.';

      throw new NotFoundException(errorMessage);
    }
    if (error.code === 'P2001') {
      throw new NotFoundException('Requested record does not exist.');
    }

    if (error.code === 'P1000' || error.code === 'P1001') {
      throw new InternalServerErrorException('Database connection error.');
    }
  }

  throw new InternalServerErrorException(message || 'Internal server error.');
}
