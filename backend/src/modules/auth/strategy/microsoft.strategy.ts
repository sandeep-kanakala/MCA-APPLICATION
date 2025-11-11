/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { BadRequestException, Injectable, Request } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-microsoft';
import { AuthService } from '../auth.service';
import type { AuthenticatedRequest } from '~/interface';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.MICROSOFT_CLIENT_ID as string,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET as string,
      callbackURL: process.env.MICROSOFT_CALLBACK_URL as string,
      scope: ['openid', 'profile', 'email', 'User.Read'],
      tenantIdOrName: process.env.MICROSOFT_TENANT_ID as string,
      prompt: 'login',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    @Request() request: AuthenticatedRequest,
  ): Promise<any> {
    const primaryEmail =
      profile.emails?.[0]?.value?.toLowerCase() ||
      profile._json.email ||
      profile._json.mail ||
      undefined;
    if (!primaryEmail) {
      throw new BadRequestException('Email not provided by Microsoft');
    }
    const userProfile = {
      provider: 'microsoft' as const,
      providerId: profile.id,
      email: primaryEmail,
      username: profile.displayName || primaryEmail?.split('@')[0],
      firstName: profile.name?.givenName,
      lastName: profile.name?.familyName,
    };
    try {
      const authResponse = await this.authService.oauthLoginOrRegister(
        userProfile,
        request,
      );
      if (!authResponse) {
        throw new Error('something went wrong!');
      }
      return authResponse.data;
    } catch (error) {
      if (
        error instanceof BadRequestException &&
        error.message.includes('Email domain must be')
      ) {
        return { error: 'domain_not_allowed', message: error.message };
      } else {
        throw error;
      }
    }
  }
}
