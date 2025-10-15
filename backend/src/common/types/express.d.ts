import { Request } from 'express';

export interface AuditRequest extends Request {
  entityId?: string;
  tenantId?: string;
  beforeUpdate?: any;
  afterUpdate?: any;
  beforeDelete?: any;
  user?: {
    id?: string;
    tenantId?: string;
    [key: string]: any;
  };
}
