import { Request } from 'express';
import { Prisma, User } from '@prisma/client';

export type UserWithRoles = Prisma.UserGetPayload<{
  include: { roles: true };
}>;
export interface AuthenticatedRequest extends Request {
  user: UserWithRoles;
}

export type UserWithoutSensitive = Omit<User, 'password' | 'otp'>;

export interface MicrosoftProfile {
  provider: 'microsoft';
  providerId: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}
