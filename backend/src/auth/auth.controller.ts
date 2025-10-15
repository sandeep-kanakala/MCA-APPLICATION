import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { SkipAudit } from '@/audit/decorators/skip-audit-log.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
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
}
