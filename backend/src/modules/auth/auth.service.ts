import {
  HttpStatus,
  Injectable,
  UnauthorizedException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import {
  LoginDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ValidateOtpDto,
} from './dto';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ResponseBuilder } from '@/utils/response.builder';
import { UserRepository } from '@/infrastructure/repositories/user.repository';
import { passwordEncoder } from '@/utils/helper';
import { PrismaService } from '@/prisma/prisma.service';
import { UserStatus } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as winston from 'winston';
import { MailUtils } from '@/utils/mailutils';

@Injectable()
export class AuthService {
  constructor(
    private users: UserRepository,
    private jwt: JwtService,
    private config: ConfigService,
    private prisma: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: winston.Logger,
    private mailUtils: MailUtils,
  ) {}

  async signin(dto: LoginDto) {
    const tenantId = this.config.get<string>('TENANT_ID');
    if (!tenantId) throw new Error('TENANT_ID not found');

    const user = await this.users.findActiveUserByEmail(dto.email, tenantId);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      type: 'LOGIN',
    };
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

  async changePassword(
    dto: ChangePasswordDto,
    authHeader?: string,
  ): Promise<any> {
    let userId: string;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const decoded: any = await this.jwt.verifyAsync(token).catch(() => {
        this.logger.error(' Invalid or expried reset token ');
        throw new UnauthorizedException('Invalid or expired reset token');
      });

      userId = decoded.userId;
    } else {
      const user = await this.prisma.user.findFirst({
        where: { email: dto.email },
      });
      if (!user) {
        this.logger.error('User not found');
        throw new UnauthorizedException('User not found');
      }
      userId = user.id;
    }

    const user = await this.prisma.user.findFirst({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const isSameAsOld = await passwordEncoder.comparePassword(
      dto.password,
      user.password,
    );
    if (isSameAsOld) {
      this.logger.error('New password cannot be same as old password');
      throw new UnauthorizedException(
        'New password cannot be same as old password',
      );
    }
    const hashedPassword = await passwordEncoder.hashPassword(dto.password);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return new ResponseBuilder()
      .withMessage('Password changed successfully')
      .build();
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<any> {
    const tenantId = this.config.get<string>('TENANT_ID');
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, tenantId, status: UserStatus.ACTIVE },
    });
    if (!user) {
      this.logger.error('User Not found');
      throw new NotFoundException('User with this email does not exist');
    }
    //const otp=123456
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.prisma.user.update({ where: { id: user.id }, data: { otp } });

    this.logger.info(`Generated OTP for ${user.email}: ${otp}`);

    this.mailUtils.sendOtpEmail(user.email, otp);

    return new ResponseBuilder()
      .withMessage('OTP sent to your registered email')
      .withData({ email: user.email })
      .build();
  }

  async validateOtp(
    dto: ValidateOtpDto,
  ): Promise<{ message: string; resetToken: string }> {
    const tenantId = this.config.get<string>('TENANT_ID');
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, tenantId, status: UserStatus.ACTIVE },
    });

    if (!user) throw new UnauthorizedException('User not found');

    if (!user.otp || user.otp !== dto.otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { otp: null },
    });

    const resetToken = await this.jwt.signAsync(
      {
        userId: user.id,
        email: user.email,
        tenantId: user.tenantId,
        type: 'RESET_PASSWORD',
      },
      { expiresIn: '15m' },
    );

    return { message: 'OTP verified successfully', resetToken };
  }
}
