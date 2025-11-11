import { Prisma } from '@prisma/client';

export interface IOAuthJwtPayload {
  userId: string;
  email: string;
  tenantId: string;
  type: string;
  role: string;
  authProvider: string;
}

export type UserWithRole = Prisma.UserGetPayload<{
  include: {
    roles: {
      select: {
        name: true;
      };
    };
  };
}>;
export interface IUserWithRole {
  user: UserWithRole;
}
