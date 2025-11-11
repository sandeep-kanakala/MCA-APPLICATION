import { UserRegisterRequestDto } from '@/modules/user/dto';
import { Subject } from '@prisma/client';
import { AuthenticatedRequest, RequestWithUser } from '~/interface';

export const mockUserToken = {
  id: 'user-1',
  tenantId: 'tenant-1',
  email: 'test@example.com',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
};

export const mockUser = {
  id: 'user-1',
  firstName: 'Test',
  middleName: 'A',
  lastName: 'Test',
  phoneNo: '1234567890',
  email: 'test@example.com',
  tenantId: 'tenant-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  roles: [
    {
      id: 'role-1',
      tenantId: 'tenant-1',
      name: 'USER',
      permissions: [
        {
          id: 'perm-1',
          name: 'READ',
          description: 'Read permission',
          subject: Subject.Account,
          tenantId: 'tenant-1',
        },
      ],
    },
  ],
};

export const mockRequest = {
  user: mockUser,
} as unknown as AuthenticatedRequest;

export const mockUpdatedUser = {
  ...mockUser,
  firstName: 'Test',
  lastName: 'Test',
  email: 'test@example.com',
};

export const mockUserRepository = {
  findUser: jest.fn(),
  createUser: jest.fn(),
  updateUserById: jest.fn(),
  count: jest.fn(),
  getAllUsers: jest.fn(),
  archiveUser: jest.fn(),
};

export const mockResponseBuilder = {
  withMessage: jest.fn().mockReturnThis(),
  withData: jest.fn().mockReturnThis(),
  withStatusCode: jest.fn().mockReturnThis(),
  build: jest.fn().mockReturnValue({ success: true }),
};

export const mockUserRegisterRequest: UserRegisterRequestDto & { id: string } =
  {
    id: 'user-1',
    firstName: 'Test',
    middleName: 'A',
    lastName: 'Test',
    email: 'test@example.com',
    password: 'Test@1234',
    role: 'USER',
    phoneNo: '+919876543210',
  };
