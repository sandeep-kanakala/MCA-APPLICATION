import { SetMetadata } from '@nestjs/common';

export const AUDIT_ENTITY_KEY = 'AUDIT_ENTITY';

export const AuditEntity = (entity: string) =>
  SetMetadata(AUDIT_ENTITY_KEY, entity);
