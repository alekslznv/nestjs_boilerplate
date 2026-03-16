import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { ACCESS_JWT, REFRESH_JWT } from './providers/jwt.providers';
import { Role, User } from 'src/generated/prisma/client';
import { CreateUserDto } from '../users/dto/create-user.dto';

jest.mock('argon2');

const VALID_ARGON2_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$RdescudvJCsgt3ub+b+daw';

const mockUsersService = {
  createOne: jest.fn(),
  findOne: jest.fn(),
  findByEmail: jest.fn(),
  updateRefreshToken: jest.fn(),
};

const mockAccessJwt = {
  sign: jest.fn().mockReturnValue('access-token'),
};

const mockRefreshJwt = {
  sign: jest.fn().mockReturnValue('refresh-token'),
  verify: jest.fn(),
};

const mockUser: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  password: VALID_ARGON2_HASH,
  role: 'USER',
  refreshToken: VALID_ARGON2_HASH,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: ACCESS_JWT, useValue: mockAccessJwt },
        { provide: REFRESH_JWT, useValue: mockRefreshJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const createUserDto: CreateUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'plaintext123',
      role: 'USER' as Role,
    };

    it('hashes the password and creates the user', async () => {
      (argon2.hash as jest.Mock).mockResolvedValue(VALID_ARGON2_HASH);
      mockUsersService.createOne.mockResolvedValue(mockUser);

      const result = await service.register(createUserDto);

      expect(argon2.hash).toHaveBeenCalledWith('plaintext123');
      expect(mockUsersService.createOne).toHaveBeenCalledWith({
        ...createUserDto,
        password: VALID_ARGON2_HASH,
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('returns access and refresh tokens', async () => {
      (argon2.hash as jest.Mock).mockResolvedValue(VALID_ARGON2_HASH);
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.login(mockUser);

      expect(mockAccessJwt.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
      });
      expect(mockRefreshJwt.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
      });
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        { refreshToken: VALID_ARGON2_HASH },
      );
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });
  });

  describe('logout', () => {
    it('clears the refresh token', async () => {
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

      await service.logout(1);

      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(1, {
        refreshToken: null,
      });
    });
  });

  describe('updateTokens', () => {
    it('returns new token pair when refresh token is valid', async () => {
      mockRefreshJwt.verify.mockResolvedValue({
        sub: 1,
        email: 'john@example.com',
      });
      mockUsersService.findOne.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      (argon2.hash as jest.Mock).mockResolvedValue(VALID_ARGON2_HASH);

      const result = await service.updateTokens('valid-refresh-token');

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        { refreshToken: VALID_ARGON2_HASH },
      );
    });

    it('throws UnauthorizedException when refresh token is expired', async () => {
      mockRefreshJwt.verify.mockRejectedValue(new Error('jwt expired'));

      await expect(service.updateTokens('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when user has no stored refresh token', async () => {
      mockRefreshJwt.verify.mockResolvedValue({
        sub: 1,
        email: 'john@example.com',
      });
      mockUsersService.findOne.mockResolvedValue({
        ...mockUser,
        refreshToken: null,
      });

      await expect(service.updateTokens('some-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when refresh token does not match stored hash', async () => {
      mockRefreshJwt.verify.mockResolvedValue({
        sub: 1,
        email: 'john@example.com',
      });
      mockUsersService.findOne.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(service.updateTokens('wrong-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validatePassword', () => {
    it('returns user when credentials are valid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await service.validatePassword(
        'john@example.com',
        'correct-password',
      );

      expect(result).toEqual(mockUser);
    });

    it('returns null when user is not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validatePassword(
        'unknown@example.com',
        'password',
      );

      expect(result).toBeNull();
      expect(argon2.verify).not.toHaveBeenCalled();
    });

    it('returns null when password is wrong', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      const result = await service.validatePassword(
        'john@example.com',
        'wrong-password',
      );

      expect(result).toBeNull();
    });
  });
});
