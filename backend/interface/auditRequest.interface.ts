import { Request } from 'express';
import { IUserTokenPayload } from './userToken.interface'; // adjust path if needed
import { User, Prisma } from '@prisma/client';

export interface AuditRequest extends Request {
  entityId?: string;
  tenantId?: string;
  beforeUpdate?: any;
  afterUpdate?: any;
  beforeDelete?: any;
  user: IUserTokenPayload | User;
}

export interface FindOneCapable {
  findOne(id: any): Promise<any>;
}

export type AuditLogFilter = Prisma.AuditLogWhereInput;
