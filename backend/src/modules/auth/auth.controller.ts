import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  UseGuards,
  Get,
  Req,
  UnauthorizedException,
  Res,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ValidateOtpDto,
  ChangePasswordLoggedInDto,
} from './dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { MicrosoftAuthGuard } from './guards/microsoft-auth.guard';
import type { AuthenticatedRequest, MicrosoftAuthRequest } from '~/interface';
import type { Response } from 'express';
import {
  ApiMethodDescription,
  changePasswordApiBody,
  changePasswordLoggedInApiBody,
  forgotPasswordApiBody,
  GetMicrosoftLoginResponses,
  GetMicrosoftRedirectResponses,
  PostChangePasswordLoggedInResponses,
  PostChangePasswordResponses,
  PostForgotPasswordResponses,
  PostSigninResponses,
  PostValidateOtpResponses,
  SigninApiBody,
  validateOtpApiBody,
} from '@/common/responses';
import { AuditEntity } from '@/audit/decorators/audit-log.decorator';

@ApiTags('Auth')
@Controller()
@AuditEntity('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/signin')
  @ApiMethodDescription('sign in')
  @PostSigninResponses()
  @SigninApiBody()
  signin(@Body() dto: LoginDto) {
    return this.authService.signin(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/forgot-password')
  @ApiMethodDescription('Forgot Password', 'Send OTP to user email')
  @PostForgotPasswordResponses()
  @forgotPasswordApiBody()
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/validate-otp')
  @ApiMethodDescription('Validate OTP', 'Verify OTP and return reset token')
  @PostValidateOtpResponses()
  @validateOtpApiBody()
  async validateOtp(@Body() dto: ValidateOtpDto) {
    return this.authService.validateOtp(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/reset-password')
  @ApiMethodDescription('Change Password')
  @PostChangePasswordResponses()
  @UseGuards(AuthGuard('reset-change-password'))
  @ApiBearerAuth('access-token')
  @changePasswordApiBody()
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Request() request: AuthenticatedRequest,
  ) {
    return this.authService.changePassword(dto, request);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/change-password')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiMethodDescription('Change Password for logged in users')
  @PostChangePasswordLoggedInResponses()
  @changePasswordLoggedInApiBody()
  changePasswordLoggedIn(
    @Body() dto: ChangePasswordLoggedInDto,
    @Request() request: AuthenticatedRequest,
  ) {
    return this.authService.changePasswordLoggedIn(dto, request);
  }

  @Get('/microsoft-login')
  @ApiMethodDescription('Microsoft Login', 'Initiate microsoft OAuth Flow')
  @GetMicrosoftLoginResponses()
  @UseGuards(MicrosoftAuthGuard)
  microsoftLogin() {
    // Guard redirects to Microsoft; this handler intentionally left blank
  }

  @Get('/microsoft/redirect')
  @ApiMethodDescription('Microsoft Login Redirect', 'Microsoft OAuth2 Callback')
  @UseGuards(MicrosoftAuthGuard)
  @GetMicrosoftRedirectResponses()
  microsoftRedirect(@Req() req: MicrosoftAuthRequest, @Res() res: Response) {
    const url = new URL(
      (this.configService.get<string>('APP_DOMAIN') || '') +
        '/auth/microsoft/callback',
    );

    if ('access_token' in req.user) {
      url.searchParams.set('token', req.user.access_token);
      return res.redirect(url.toString());
    }

    return res.redirect('/microsoft-login');
  }
}
