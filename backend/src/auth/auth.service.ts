import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto, SignupDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { passwordEncoder } from '../common/password.encoder';
import { ResponseBuilder } from '@/common/response.builder';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: SignupDto) {
    try {
      const tenantId = this.config.get<string>('TENANT_ID');
      if (!tenantId) throw new Error('TENANT_ID not found in config');

      const hashedPassword = await passwordEncoder.hashPassword(dto.password)
      const user = await this.prisma.user.create({
        data: {
          firstName:"",
          lastName:"",
          createdBy:"",
          phoneNo:"",
          email: dto.email,
          password: hashedPassword,
          tenantId,
        },
        select: {
          id: true,
          email: true,
          tenantId: true,
          createdAt: true
        }
      })
      return new ResponseBuilder().withMessage("User created successfully").withData(user).build();
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ForbiddenException('Email already exists');
      }
      throw error;
    }
  }

  async signin(dto: LoginDto) {
    const tenantId = this.config.get<string>('TENANT_ID');
    if (!tenantId) throw new Error('TENANT_ID not found in config');

    const user = await this.prisma.user.findUnique({
      where: {
        deletedAt:null,
        email_tenantId: {
          email: dto.email,
          tenantId,
        },
      },
    });
    if (!user) throw new UnauthorizedException('User not found !')
    const pwMatches = await bcrypt.compare(dto.password, user.password)
    if (!pwMatches) throw new UnauthorizedException('Invalid credentials')

    return this.signToken(user.id, user.email, user.tenantId);
  }

  async signToken(
    userId: string,
    email: String,
    tenantId: string,
  ): Promise<{ access_token: string }> {
    const payload = { sub: userId, email, tenantId };
    const token = await this.jwt.signAsync(payload);
    return { access_token: token };
  }

  public async validateTokenPayload(userId: string, username: string) {
        const userData = await this.prisma.user.findFirst({
            where: { id: userId, deletedAt: null }
        });

        if (!userData) {
            throw new UnauthorizedException("Token invalid (or) expired !");
        }
        return true
    }

}
