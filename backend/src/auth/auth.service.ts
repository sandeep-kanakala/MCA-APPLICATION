import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { LoginDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ResponseBuilder } from '@/utils/response.builder';
import { UserStatus } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as winston from 'winston';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: winston.Logger,
  ) {}

  async signin(dto: LoginDto) {
    this.logger.info(`Attempting to sign in user: ${dto.email}`);
    const tenantId = this.config.get<string>('TENANT_ID');
    if (!tenantId) {
      this.logger.error('TENANT_ID not found in config');
      throw new Error('TENANT_ID not found in config');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
        tenantId: tenantId,
        status: UserStatus.ACTIVE,
      },
    });
    if (!user) {
      this.logger.error(`User not found or inactive for email: ${dto.email}`);
      throw new UnauthorizedException('User not found !');
    }
    const pwMatches = await bcrypt.compare(dto.password, user.password);

    if (!pwMatches) {
      this.logger.error(`Invalid credentials for user: ${dto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }
    this.logger.info(`User ${dto.email} signed in successfully.`);
    return this.signToken(user.id, user.email, user.tenantId);
  }

  async signToken(
    userId: string,
    email: string,
    tenantId: string,
  ): Promise<any> {
    this.logger.info(`Generating token for user ID: ${userId}`);
    const payload = { userId, email, tenantId };
    const token = await this.jwt.signAsync(payload);
    const response = new ResponseBuilder().build();
    this.logger.info(`Token generated successfully for user ID: ${userId}`);
    return { response, access_token: token };
  }

  public async validateTokenPayload(userId: string) {
    this.logger.info(`Validating token payload for user ID: ${userId}`);
    const userData = await this.prisma.user.findFirst({
      where: { id: userId, status: UserStatus.ACTIVE },
    });

    if (!userData) {
      this.logger.error(`Token invalid or expired for user ID: ${userId}`);
      throw new UnauthorizedException('Token invalid (or) expired !');
    }
    this.logger.info(
      `Token payload validated successfully for user ID: ${userId}`,
    );
    return userData;
  }
}
