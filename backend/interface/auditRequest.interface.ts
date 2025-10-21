import { Request } from 'express';
import { IUserTokenPayload } from './userToken.interface'; // adjust path if needed

export interface AuditRequest extends Request {
  entityId?: string;
  tenantId?: string;
  beforeUpdate?: any;
  afterUpdate?: any;
  beforeDelete?: any;
  user: IUserTokenPayload;
}
