import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Role, User } from 'src/generated/prisma/client';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  updateTokens: jest.fn(),
};

const mockUser: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  password: '$argon2id$hashed',
  role: 'USER',
  refreshToken: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTokenPair = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<typeof mockAuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /auth/signup', () => {
    const createUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: Role.USER,
    };

    it('creates and returns a new user', async () => {
      mockAuthService.register.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(authService.register).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('POST /auth/signin', () => {
    it('returns token pair for authenticated user', async () => {
      mockAuthService.login.mockResolvedValue(mockTokenPair);

      const result = await controller.login(mockUser);

      expect(result).toEqual(mockTokenPair);
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('POST /auth/logout', () => {
    it('calls logout with the user id', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      await controller.logout(mockUser);

      expect(authService.logout).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('POST /auth/refresh', () => {
    it('returns new token pair with valid refresh token', async () => {
      mockAuthService.updateTokens.mockResolvedValue(mockTokenPair);

      const result = await controller.refreshToken({
        refreshToken: 'valid-refresh-token',
      });

      expect(result).toEqual(mockTokenPair);
      expect(authService.updateTokens).toHaveBeenCalledWith(
        'valid-refresh-token',
      );
    });

    it('throws when refresh token is invalid', async () => {
      mockAuthService.updateTokens.mockRejectedValue(
        new UnauthorizedException('Invalid refresh token'),
      );

      await expect(
        controller.refreshToken({ refreshToken: 'invalid-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
