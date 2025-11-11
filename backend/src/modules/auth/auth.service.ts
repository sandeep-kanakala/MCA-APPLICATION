import {
  HttpStatus,
  Injectable,
  UnauthorizedException,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  LoginDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ValidateOtpDto,
  ChangePasswordLoggedInDto,
} from './dto';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response, ResponseBuilder } from '@/utils/response.builder';
import { UserRepository } from '@/infrastructure/repositories/user.repository';
import { hash, passwordEncoder } from '@/utils/helper';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as winston from 'winston';
import { MailUtils } from '@/utils/mailutils';
import {
  AuthenticatedRequest,
  MicrosoftProfile,
  IOAuthJwtPayload,
  UserWithRoles,
} from '~/interface';
import { handleError } from '@/utils';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
    private userRepository: UserRepository,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: winston.Logger,
    private mailUtils: MailUtils,
  ) {}

  async signin(dto: LoginDto) {
    try {
      const tenantId = this.config.get<string>('TENANT_ID');
      if (!tenantId) throw new Error('TENANT_ID not found');
      const lowercasedEmail = dto.email.toLowerCase();
      const user = await this.userRepository.findUser({
        email: lowercasedEmail,
        tenantId,
      });
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      if (!user.password) {
        throw new BadRequestException(
          'This account does not have a password. Please sign in with Microsoft.',
        );
      }
      const isPasswordMatch = await bcrypt.compare(dto.password, user.password);
      if (!isPasswordMatch) {
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
        .withData({ access_token })
        .build();
    } catch (error: unknown) {
      this.logger.error('Signin failed', error);
      handleError(error);
    }
  }

  public async validateTokenPayload(id: string) {
    try {
      const include: Prisma.UserInclude = {
        roles: {
          include: {
            permissions: true,
          },
        },
      };
      const user = await this.userRepository.findUser({ id }, include);
      if (!user) throw new UnauthorizedException('Token invalid or expired');
      return user;
    } catch (error: unknown) {
      handleError(error);
    }
  }

  async changePasswordLoggedIn(
    dto: ChangePasswordLoggedInDto,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { email, oldPassword, newPassword } = dto;
    const { user } = request;
    if (user.email !== email) {
      throw new UnauthorizedException('Unauthorized to change password!');
    }
    const lowercasedEmail = email.toLowerCase();
    const dbUser = await this.userRepository.findUser({
      email: lowercasedEmail,
    });

    if (!dbUser) {
      this.logger.error('User not found');
      throw new BadRequestException('User not found');
    }

    if (!dbUser.password) {
      this.logger.error('User does not have a password set');
      throw new BadRequestException('User does not have a password set');
    }

    const isPasswordMatch = await passwordEncoder.comparePassword(
      oldPassword,
      dbUser.password,
    );

    if (!isPasswordMatch) {
      this.logger.error('Old password does not match');
      throw new BadRequestException('Old password does not match');
    }

    const isSameAsOld = await passwordEncoder.comparePassword(
      newPassword,
      dbUser.password,
    );

    if (isSameAsOld) {
      this.logger.error('New password cannot be same as old password');
      throw new BadRequestException(
        'New password cannot be same as old password',
      );
    }

    const hashedPassword = await passwordEncoder.hashPassword(newPassword);
    await this.userRepository.updateUserById(dbUser.id, {
      password: hashedPassword,
    });

    return new ResponseBuilder()
      .withMessage('Password changed successfully')
      .build();
  }

  async changePassword(
    dto: ChangePasswordDto,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    try {
      const { user } = request;
      const { password } = dto;
      const lowercasedEmail = dto.email.toLowerCase();
      const isUserExists = await this.userRepository.findUser({
        email: lowercasedEmail,
      });
      if (!isUserExists) {
        this.logger.error('User not found');
        throw new NotFoundException('User not found');
      }
      if (!user?.password) {
        throw new Error('Something went wrong!');
      }
      const isSameAsOld = await passwordEncoder.comparePassword(
        password,
        user.password,
      );
      if (isSameAsOld) {
        this.logger.error('New password cannot be same as old password');
        throw new BadRequestException(
          'New password cannot be same as old password',
        );
      }
      const hashedPassword = await passwordEncoder.hashPassword(password);
      const updated = await this.userRepository.updateUserById(user.id, {
        password: hashedPassword,
      });
      if (!updated) {
        throw new Error('failed to update password!');
      }
      return new ResponseBuilder()
        .withMessage('Password changed successfully')
        .build();
    } catch (error: unknown) {
      this.logger.error('changePassword failed', error);
      handleError(error, 'Password change failed');
    }
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<Response> {
    const tenantId = this.config.get<string>('TENANT_ID');
    const lowercasedEmail = dto.email.toLowerCase();
    const user = await this.userRepository.findUser({
      email: lowercasedEmail,
      tenantId,
      isArchived: false,
    });
    if (!user) {
      this.logger.error('User Not found');
      throw new NotFoundException('User with this email does not exist');
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpSaved = await this.userRepository.updateUserById(user.id, { otp });
    if (!otpSaved) {
      throw new Error('failed to generate otp');
    }
    await this.mailUtils.sendOtpEmail(user.email, otp);

    return new ResponseBuilder()
      .withMessage(`OTP sent to ${user.email}`)
      .build();
  }

  async validateOtp(
    dto: ValidateOtpDto,
  ): Promise<{ message: string; resetToken: string }> {
    try {
      const lowercasedEmail = dto.email.toLowerCase();
      const tenantId = this.config.get<string>('TENANT_ID');
      const user = await this.userRepository.findUser({
        email: lowercasedEmail,
        tenantId,
        isArchived: false,
      });

      if (!user) throw new NotFoundException('User not found');

      if (!user.otp || user.otp !== dto.otp) {
        throw new BadRequestException('Invalid or expired OTP');
      }

      await this.userRepository.updateUserById(user.id, { otp: null });
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
    } catch (error: unknown) {
      this.logger.error('validateOtp failed', error);
      handleError(error, 'OTP validation failed');
    }
  }

  async oauthLoginOrRegister(
    profile: MicrosoftProfile,
    request: AuthenticatedRequest,
  ): Promise<Response | undefined> {
    try {
      this.logger.info('OAuth profile received:', profile);

      const { user } = request;
      const { email } = profile;

      if (!email) {
        throw new BadRequestException('Email not provided by provider');
      }

      const allowedDomain = '@linkfields.com';
      if (!email.endsWith(allowedDomain)) {
        throw new BadRequestException(`Email domain must be ${allowedDomain}`);
      }

      const tenantId = this.config.get<string>('TENANT_ID') as string;
      if (!tenantId) throw new Error('TENANT_ID not found');

      const include: Prisma.UserInclude = {
        roles: {
          select: {
            name: true,
          },
        },
      };
      const lowercasedEmail = email.toLowerCase();
      const duplicateUser: UserWithRoles = (await this.userRepository.findUser(
        { email: lowercasedEmail, tenantId },
        include,
      )) as UserWithRoles;

      this.logger.info('Existing user found:', duplicateUser);

      if (!duplicateUser) {
        this.logger.info('Creating new user with profile:', {
          email: profile.email,
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          role: 'USER',
        });

        try {
          const password = await passwordEncoder.hashPassword(
            this.config.get<string>('DEFAULT_PASSWORD') as string,
          );

          const createInput: Prisma.UserCreateInput = {
            id: hash(lowercasedEmail),
            email: lowercasedEmail,
            password: password,
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            tenant: {
              connect: { id: tenantId },
            },
          };

          const include: Prisma.UserInclude = {
            roles: {
              select: {
                name: true,
              },
            },
          };

          const newUser = await this.userRepository.createUser(
            createInput,
            include,
          );

          if (!newUser) {
            throw new Error('Failed to register');
          }

          const payload: IOAuthJwtPayload = {
            userId: newUser.id,
            email: newUser.email,
            tenantId: newUser.tenantId,
            type: 'LOGIN',
            role: 'USER',
            authProvider: 'MICROSOFT',
          };

          const access_token = await this.jwt.signAsync(payload);

          return new ResponseBuilder()
            .withStatusCode(HttpStatus.OK)
            .withMessage('Microsoft login successful')
            .withData({
              access_token,
              user: {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.firstName ?? '',
                lastName: newUser.lastName ?? '',
                role: 'USER',
                authProvider: 'MICROSOFT',
                hasLocalPassword: false,
              },
            })
            .build();
        } catch (error) {
          this.logger.error('Error creating user:', error);
          handleError(error);
        }
      }

      // If user exists, issue token normally
      const payload: IOAuthJwtPayload = {
        userId: duplicateUser.id,
        email: duplicateUser.email,
        tenantId: duplicateUser.tenantId,
        type: 'LOGIN',
        role:
          duplicateUser.roles && duplicateUser.roles.length > 0
            ? duplicateUser.roles[0].name
            : 'USER',
        authProvider: 'MICROSOFT',
      };

      const access_token = await this.jwt.signAsync(payload);

      return new ResponseBuilder()
        .withStatusCode(HttpStatus.OK)
        .withMessage('Microsoft login successful')
        .withData({
          access_token,
          user: {
            id: duplicateUser.id,
            email: duplicateUser.email,
            firstName: duplicateUser.firstName ?? '',
            lastName: duplicateUser.lastName ?? '',
            role:
              duplicateUser.roles && duplicateUser.roles.length > 0
                ? duplicateUser.roles[0].name
                : 'USER',
            authProvider: 'MICROSOFT',
            hasLocalPassword: !!duplicateUser.password,
          },
        })
        .build();
    } catch (error) {
      this.logger.error('OAuth login failed:', error);
      handleError(error);
    }
  }
}
