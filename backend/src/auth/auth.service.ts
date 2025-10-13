import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto, SignupDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ResponseBuilder } from '@/utils/response.builder';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signin(dto: LoginDto) {
    const tenantId = this.config.get<string>('TENANT_ID');
    if (!tenantId) throw new Error('TENANT_ID not found in config');

    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
        tenantId: tenantId,
        deletedAt: null,
      },
    });
    if (!user) throw new UnauthorizedException('User not found !');
    const pwMatches = await bcrypt.compare(dto.password, user.password);
    if (!pwMatches) throw new UnauthorizedException('Invalid credentials');

    return this.signToken(user.id, user.email, user.tenantId, user.role);
  }

  async signToken(
    userId: string,
    email: String,
    tenantId: string,
    role: string,
  ): Promise<any> {
    const payload = { userId, email, tenantId, role };
    const token = await this.jwt.signAsync(payload);
    const response = new ResponseBuilder().build();
    return { response, access_token: token };
  }

  public async validateTokenPayload(userId: string, username: string) {
    const userData = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!userData) {
      throw new UnauthorizedException('Token invalid (or) expired !');
    }
    return true;
  }
}
