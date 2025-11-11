import { Request } from 'express';
import { IUserTokenPayload } from './userToken.interface'; // adjust path if needed
import { User, Prisma } from '@prisma/client';

export interface AuditRequest extends Request {
  entityId?: string;
  tenantId?: string;
  beforeUpdate?: unknown;
  afterUpdate?: unknown;
  beforeDelete?: unknown;
  user: IUserTokenPayload | User;
}

export interface FindOneCapable {
  findOne(id: string): Promise<unknown>;
}

export type AuditLogDetails = {
  before?: unknown;
  after?: unknown;
  body?: unknown;
  query?: unknown;
  params?: unknown;
  response?: unknown;
  user?: {
    email?: string;
    userId?: string;
    tenantId?: string;
  };
};

export type AuditLogFilter = Prisma.AuditLogWhereInput;
