import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, JwtFromRequestFunction, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
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
    const user = await this.authService.validateTokenPayload(payload.userId);
    if (!user) {
      throw new UnauthorizedException('User not found or token invalid');
    }
    if (payload.type !== 'LOGIN') {
      throw new UnauthorizedException('Token not valid for this API');
    }
    const { password: _, ...safeUser } = user;
    return safeUser;
  }
}
