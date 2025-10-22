import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { IUserTokenPayload } from '~/interface';
import { User } from '@prisma/client';

export const AccessToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || typeof authHeader !== 'string') return undefined;

    return authHeader.replace('Bearer ', '');
  },
);

export function hashEmail(email: string): string {
  return crypto.createHash('md5').update(email).digest('hex');
}

export class passwordEncoder {
  public static async hashPassword(plainPassword: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    return hashedPassword;
  }
  public static async comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

export function isIUserTokenPayload(
  user: IUserTokenPayload | User,
): user is IUserTokenPayload {
  return (user as IUserTokenPayload).id !== undefined;
}
