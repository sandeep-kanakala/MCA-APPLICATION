import {
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ResponseBuilder } from '@/utils/response.builder';
import { UserRepository } from '@/infrastructure/repositories/user.repository';


@Injectable()
export class AuthService {
  constructor(
    private users: UserRepository,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signin(dto: LoginDto) {
   const tenantId = this.config.get<string>('TENANT_ID');
    if (!tenantId) throw new Error('TENANT_ID not found');

    const user = await this.users.findActiveUserByEmail(dto.email, tenantId);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { userId: user.id, email: user.email, tenantId: user.tenantId };
    const access_token = await this.jwt.signAsync(payload);

   return new ResponseBuilder()
  .withStatusCode(HttpStatus.OK)
  .withMessage('Login successful')
  .withData({ access_token: access_token })
  .build();

  }

  public async validateTokenPayload(userId: string) {
     const user = await this.users.findActiveUserById(userId);
    if (!user) throw new UnauthorizedException('Token invalid or expired');
    return user;

  }
}
