import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LocalStrategy } from './local.strategy';
import { AuthService } from '../auth.service';
import { User } from 'src/generated/prisma/client';

const mockAuthService = {
  validatePassword: jest.fn(),
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

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns user when credentials are valid', async () => {
    mockAuthService.validatePassword.mockResolvedValue(mockUser);

    const result = await strategy.validate('john@example.com', 'password123');

    expect(result).toEqual(mockUser);
    expect(mockAuthService.validatePassword).toHaveBeenCalledWith(
      'john@example.com',
      'password123',
    );
  });

  it('throws UnauthorizedException when credentials are invalid', async () => {
    mockAuthService.validatePassword.mockResolvedValue(null);

    await expect(
      strategy.validate('john@example.com', 'wrong-password'),
    ).rejects.toThrow(UnauthorizedException);
  });
});
