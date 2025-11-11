/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, JwtFromRequestFunction, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class ResetPasswordJwtStrategy extends PassportStrategy(
  Strategy,
  'reset-change-password',
) {
  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService,
  ) {
    const jwtSecret = config.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not found in config');
    }

    const jwtFromRequest: JwtFromRequestFunction<Request> =
      ExtractJwt.fromAuthHeaderAsBearerToken();

    super({
      jwtFromRequest,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: {
    userId: string;
    email: string;
    tenantId: string;
    type: string;
  }) {
    if (payload.type !== 'RESET_PASSWORD') {
      throw new UnauthorizedException('Token not valid for password reset');
    }

    const user = await this.authService.validateTokenPayload(payload.userId);
    if (!user) {
      throw new UnauthorizedException('User not found or token invalid');
    }

    return user;
  }
}
