import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/modules/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ResponseBuilder } from 'src/utils/response.builder';
import { UserRepository } from '@/infrastructure/repositories/user.repository';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { MailUtils } from '@/utils/mailutils';

jest.mock('bcrypt');
jest.mock('src/utils/response.builder');

const mockedBcrypt = bcrypt as unknown as {
  compare: jest.Mock;
};

describe('AuthService (Unit)', () => {
  let authService: AuthService;
  let userRepository: UserRepository;
  let jwt: JwtService;
  let config: ConfigService;
  let mailUtils: MailUtils;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: {
            findActiveUserByEmail: jest.fn(),
            findActiveUserById: jest.fn(),
            findActiveUserByIdWithPermissions: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findFirst: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
        {
          provide: MailUtils,
          useValue: {
            sendOtpEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    jwt = module.get<JwtService>(JwtService);
    config = module.get<ConfigService>(ConfigService);
    mailUtils = module.get<MailUtils>(MailUtils);

    // Mock ResponseBuilder to return dummy object
    (ResponseBuilder as jest.Mock).mockImplementation(() => ({
      build: jest.fn().mockReturnValue({ success: true }),
      withMessage: jest.fn().mockReturnThis(),
      withStatusCode: jest.fn().mockReturnThis(),
      withData: jest.fn().mockReturnThis(),
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ----------------- SIGNIN -----------------
  describe('signin()', () => {
    it('should throw error if TENANT_ID not found in config', async () => {
      jest.spyOn(config, 'get').mockReturnValue(null);

      await expect(
        authService.signin({ email: 'test@example.com', password: '12345' }),
      ).rejects.toThrow('TENANT_ID not found');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      jest.spyOn(config, 'get').mockReturnValue('tenant_1');
      userRepository.findUser = jest.fn().mockResolvedValue(null);

      await expect(
        authService.signin({ email: 'test@example.com', password: '12345' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      jest.spyOn(config, 'get').mockReturnValue('tenant_1');
      userRepository.findUser = jest.fn().mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        password: 'hashed_pw',
        tenantId: 'tenant_1',
        isArchived: true,
      });

      (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValue(false);
      await expect(
        authService.signin({ email: 'test@example.com', password: 'wrongpw' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return access_token and response when credentials are valid', async () => {
      jest.spyOn(config, 'get').mockReturnValue('tenant_1');
      const jwtSignSpy = jest
        .spyOn(jwt, 'signAsync')
        .mockResolvedValue('mock-jwt-token');
      userRepository.findUser = jest.fn().mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        password: 'hashed_pw',
        tenantId: 'tenant_1',
        isArchived: true,
      });
      mockedBcrypt.compare.mockResolvedValue(true);
      (jwt.signAsync as jest.Mock).mockResolvedValue('mock-jwt-token');

      const result = await authService.signin({
        email: 'test@example.com',
        password: '12345',
      });

      expect(result).toEqual({ success: true });
      expect(jwtSignSpy).toHaveBeenCalledWith({
        userId: '1',
        email: 'test@example.com',
        tenantId: 'tenant_1',
        type: 'LOGIN',
      });
    });
  });

  // --------------- VALIDATE TOKEN PAYLOAD ----------------
  describe('validateTokenPayload()', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      userRepository.findUser = jest.fn().mockResolvedValue(null);

      await expect(authService.validateTokenPayload('1')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return user data if token payload is valid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        isArchived: true,
      };
      userRepository.findUser = jest.fn().mockResolvedValue(mockUser);

      const result = await authService.validateTokenPayload('1');
      expect(result).toEqual(mockUser);
    });
  });
});
