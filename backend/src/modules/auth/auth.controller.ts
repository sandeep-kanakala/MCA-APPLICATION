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
import {
  ApiOperation,
  ApiBody,
  ApiBearerAuth,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { SkipAudit } from '@/audit/decorators/skip-audit-log.decorator';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Auth')
@Controller('auth')
@ApiResponse({
  status: 400,
  description: 'The request is malformed or invalid.',
})
@ApiResponse({
  status: 403,
  description:
    'The user does not have the necessary privileges to perform the operation.',
})
@ApiResponse({
  status: 500,
  description: 'An internal server error occurred.',
})
@ApiResponse({
  status: 503,
  description: 'A service is unreachable.',
})
@ApiResponse({
  status: 504,
  description: 'Gateway Timeout Error.',
})
@ApiResponse({
  status: 200,
  description: 'OK',
})
@ApiResponse({
  status: 202,
  description: 'Accepted',
})
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  @ApiOperation({
    summary: 'User Sign In',
    description: 'Authenticate user and return access token',
  })
  @ApiResponse({
    status: 200,
    description: 'User signed in successfully.',
  })
  @SkipAudit()
  @ApiBody({
    type: LoginDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
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
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully.',
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
  @ApiResponse({
    status: 200,
    description: 'OTP validated successfully.',
  })
  @SkipAudit()
  @ApiBody({
    type: ValidateOtpDto,
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
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @SkipAudit()
  @UseGuards(AuthGuard('reset-change-password'))
  @ApiBearerAuth('access-token')
  @ApiBody({
    type: ChangePasswordDto,
  })
  changePassword(@Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(dto);
  }
}
