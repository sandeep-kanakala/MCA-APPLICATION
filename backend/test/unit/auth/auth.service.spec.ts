import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserStatus } from '@prisma/client';
import { ResponseBuilder } from 'src/utils/response.builder';

jest.mock('bcrypt');
jest.mock('src/utils/response.builder');

describe('AuthService (Unit)', () => {
  let authService: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;
  let config: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findFirst: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
    config = module.get<ConfigService>(ConfigService);

    // Mock ResponseBuilder to return dummy object
    (ResponseBuilder as jest.Mock).mockImplementation(() => ({
      build: jest.fn().mockReturnValue({ success: true }),
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SIGNIN TESTS

  describe('signin()', () => {
    it('should throw error if TENANT_ID not found in config', async () => {
      jest.spyOn(config, 'get').mockReturnValue(null);

      await expect(
        authService.signin({ email: 'test@example.com', password: '12345' }),
      ).rejects.toThrow('TENANT_ID not found in config');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      jest.spyOn(config, 'get').mockReturnValue('tenant_1');
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.signin({ email: 'test@example.com', password: '12345' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      jest.spyOn(config, 'get').mockReturnValue('tenant_1');
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        password: 'hashed_pw',
        tenantId: 'tenant_1',
        status: UserStatus.ACTIVE,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.signin({ email: 'test@example.com', password: 'wrongpw' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return access_token and response when credentials are valid', async () => {
      jest.spyOn(config, 'get').mockReturnValue('tenant_1');
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        password: 'hashed_pw',
        tenantId: 'tenant_1',
        status: UserStatus.ACTIVE,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.signAsync as jest.Mock).mockResolvedValue('mock-jwt-token');

      const result = await authService.signin({
        email: 'test@example.com',
        password: '12345',
      });

      expect(result).toEqual({
        response: { success: true },
        access_token: 'mock-jwt-token',
      });

      expect(jwt.signAsync).toHaveBeenCalledWith({
        userId: '1',
        email: 'test@example.com',
        tenantId: 'tenant_1',
      });
    });
  });

  // validateTokenPayload TESTS

  describe('validateTokenPayload()', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(authService.validateTokenPayload('1')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return user data if token payload is valid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        status: UserStatus.ACTIVE,
      };
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.validateTokenPayload('1');
      console.log('result***', result);

      expect(result).toEqual(mockUser);
    });
  });
});
