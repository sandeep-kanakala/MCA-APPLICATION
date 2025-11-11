import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'src/modules/user/user.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  mockUser,
  mockUpdatedUser,
  mockRequest,
  mockUserRegisterRequest,
} from './user.mock';
import { ResponseBuilder } from '@/utils/response.builder';
import { UserUpdateRequestDto } from '@/modules/user/dto/user.update.dto';
import { UserRepository } from '@/infrastructure/repositories/user.repository';
import { mockUserRepository, mockResponseBuilder } from './user.mock';

describe('UserService (Unit)', () => {
  let service: UserService;
  let userRepo: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
        },
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        { provide: ResponseBuilder, useValue: mockResponseBuilder },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // CREATE USER
  describe('create()', () => {
    it('should throw ConflictException if user already exists', async () => {
      mockUserRepository.findUser = jest.fn().mockResolvedValue(mockUser);
      mockUserRepository.createUser = jest.fn().mockResolvedValue(mockUser);

      await expect(
        service.create(mockUserRegisterRequest, mockRequest),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user successfully', async () => {
      mockUserRepository.findUser = jest.fn().mockResolvedValue(null);
      mockUserRepository.createUser = jest.fn().mockResolvedValue(mockUser);

      const result = await service.create(mockUserRegisterRequest, mockRequest);
      expect(result).toEqual(
        expect.objectContaining({
          statusCode: 201,
          message: 'User created successfully.',
        }),
      );
    });
  });

  // GET ALL USERS
  describe('getAll()', () => {
    it('should return paginated users', async () => {
      mockUserRepository.count.mockResolvedValue(1);
      mockUserRepository.getAllUsers.mockResolvedValue([mockUser]);

      const result = await service.getAll(1, 10);

      expect(result).toEqual(
        expect.objectContaining({
          statusCode: 200,
          message: 'Users fetched successfully.',
        }),
      );

      expect(mockUserRepository.count).toHaveBeenCalled();
      expect(mockUserRepository.getAllUsers).toHaveBeenCalledWith(
        expect.objectContaining({ isArchived: false }),
        expect.objectContaining({ roles: { select: { name: true } } }),
        0,
        10,
        { createdAt: 'desc' },
      );
    });
  });

  // GET USER BY ID
  describe('getUserById()', () => {
    it('should throw NotFoundException if user not found', async () => {
      userRepo.findUser = jest.fn().mockResolvedValue(null);

      await expect(service.getUserById('user-2')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return user successfully', async () => {
      userRepo.findUser = jest.fn().mockResolvedValue(mockUser);

      const result = await service.getUserById('user-1');

      expect(result).toEqual(
        expect.objectContaining({
          message: 'User fetched successfully.',
          statusCode: 200,
        }),
      );
    });
  });

  // UPDATE USER
  describe('update()', () => {
    it('should throw NotFoundException if user not found', async () => {
      userRepo.findUser = jest.fn().mockResolvedValue(null);

      await expect(
        service.update('user-1', {} as UserUpdateRequestDto, mockRequest),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update user successfully', async () => {
      userRepo.findUser = jest.fn().mockResolvedValue(mockUser);
      userRepo.updateUserById = jest.fn().mockResolvedValue(mockUpdatedUser);

      const dto: UserUpdateRequestDto = { firstName: 'Testtt' };

      const result = await service.update('user-1', dto, mockRequest);

      expect(result).toEqual(
        expect.objectContaining({
          statusCode: 200,
          message: 'User updated successfully.',
        }),
      );
    });
  });

  // DELETE USER
  describe('delete()', () => {
    it('should throw NotFoundException if user not found', async () => {
      userRepo.findUser = jest.fn().mockResolvedValue(null);
      await expect(service.delete('user-2', mockRequest)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete user successfully', async () => {
      userRepo.findUser = jest.fn().mockResolvedValue(mockUser);
      userRepo.archiveUser = jest.fn().mockResolvedValue(mockUpdatedUser);

      const result = await service.delete('user-1', mockRequest);

      expect(result).toEqual(
        expect.objectContaining({
          data: null,
          message: 'User deleted successfully.',
          statusCode: 204,
        }),
      );
    });
  });
});
