import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ValidateOtpDto,
} from './dto';
import { ApiOperation, ApiBody, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SkipAudit } from '@/audit/decorators/skip-audit-log.decorator';
import { AuthGuard } from '@nestjs/passport';
import { ApiCommonResponses } from '@/common';

@ApiTags('Auth')
@Controller('auth')
@ApiCommonResponses()
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('signin')
  @ApiOperation({
    summary: 'User Sign In',
    description: 'Authenticate user and return access token',
  })
  @SkipAudit()
  @ApiBody({
    type: LoginDto,
    examples: {
      example: {
        summary: 'User-I',
        value: {
          email: 'admin@linkfields.com',
          password: 'Passw0rd!',
        },
      },
    },
  })
  signin(@Body() dto: LoginDto) {
    return this.authService.signin(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  @ApiOperation({
    summary: 'Forgot Password',
    description: 'Send OTP to user email',
  })
  @SkipAudit()
  @ApiBody({
    type: ForgotPasswordDto,
  })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('validate-otp')
  @ApiOperation({
    summary: 'Validate OTP',
    description: 'Verify OTP and return reset token',
  })
  @SkipAudit()
  @ApiBody({
    type: ValidateOtpDto,
    examples: {
      example: {
        summary: 'sample',
        value: {
          email: 'admin@linkfields.com',
          otp: '123456',
        },
      },
    },
  })
  validateOtp(@Body() dto: ValidateOtpDto) {
    return this.authService.validateOtp(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  @ApiOperation({
    summary: 'Change Password',
    description: 'Change user password',
  })
  @SkipAudit()
  @UseGuards(AuthGuard('reset-change-password'))
  @ApiBearerAuth('access-token')
  @ApiBody({
    type: ChangePasswordDto,
    examples: {
      example: {
        summary: 'sample',
        value: {
          email: 'user@example.com',
          password: 'Passw0rd@',
        },
      },
    },
  })
  changePassword(@Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(dto);
  }
}
