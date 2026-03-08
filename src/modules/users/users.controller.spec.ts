import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserResponseDto } from './dto/user-response.dto';

const mockUserService = {
  findAll: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let userService: jest.Mocked<typeof mockUserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    userService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET / (findAll)', () => {
    it('should return an array of users', async () => {
      const mockUsers: UserResponseDto[] = [
        {
          id: 1,
          name: 'Alice',
          email: 'alice@example.com',
          createdAt: '2026-03-07T19:41:14.688Z',
          updatedAt: '2026-03-07T19:41:14.688Z',
        },
        {
          id: 2,
          name: 'Bob',
          email: 'bob@example.com',
          createdAt: '2026-03-07T19:41:14.688Z',
          updatedAt: '2026-03-07T19:41:14.688Z',
        },
      ];
      mockUserService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(result).toEqual(mockUsers);
      expect(userService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no users exist', async () => {
      mockUserService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(userService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors thrown by UserService', async () => {
      const error = new Error('Database connection failed');
      mockUserService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow(
        'Database connection failed',
      );
      expect(userService.findAll).toHaveBeenCalledTimes(1);
    });
  });
});
