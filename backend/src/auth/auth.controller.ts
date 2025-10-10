import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './dto';
import {
    ApiBody
} from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  
  @ApiBody({
        type: LoginDto,
        examples: {
            example: {
                summary: 'User-I',
                value: {
                    email: 'skanakala@linkfields.com',
                    password: 'Passw0rd!'
                },
            },

        },
    })

    @Post('signin')
    signin(@Body() dto: LoginDto) {
        return this.authService.signin(dto);
    }
}
