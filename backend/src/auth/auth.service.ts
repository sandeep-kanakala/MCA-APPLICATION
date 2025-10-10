import { ForbiddenException, Injectable } from '@nestjs/common';
import { LoginDto, SignupDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService
  ) { }

  async signup(dto: SignupDto) {
    try {
      const tenantId = this.config.get<string>('TENANT_ID');
      if (!tenantId) throw new Error('TENANT_ID not found in config');

      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          tenantId

        },
        select: {
          id: true,
          email: true,
          tenantId: true,
          createdAt: true
        }
      })
      return {
        message: "User created successfully",
        user
      }
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ForbiddenException('Email already exists');
      }
      throw error;
    }
  }

  async signin(dto: LoginDto) {
    const tenantId = this.config.get<string>("TENANT_ID")
    if (!tenantId) throw new Error('TENANT_ID not found in config');
    const hashedPassword = await bcrypt.hash(dto.password, 10);



    const user = await this.prisma.user.findUnique({
      where: {
        email_tenantId: {
          email: dto.email,
          tenantId,
        },
      },
    });
    if (!user) throw new ForbiddenException('Invalid credentials')
    const pwMatches = await bcrypt.compare(dto.password, user.password)
    if (!pwMatches) throw new ForbiddenException('Invalid credentials')

    return this.signToken(user.id, user.email, user.tenantId)
  }



  async signToken(userId: string, email: String, tenantId: string): Promise<{ access_token: string }> {

    const payload = { sub: userId, email, tenantId }
    const token = await this.jwt.signAsync(payload);
    return { access_token: token }

  }
}
