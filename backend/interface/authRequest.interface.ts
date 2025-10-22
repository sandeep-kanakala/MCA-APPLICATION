import { Request } from 'express';
import { Prisma, User } from '@prisma/client';

export type UserWithRoles = Prisma.UserGetPayload<{
  include: { roles: true };
}>;
export interface AuthenticatedRequest extends Request {
  user: UserWithRoles;
}
