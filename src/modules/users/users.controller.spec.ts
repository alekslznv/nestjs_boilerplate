import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserResponseDto } from './dto/user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const mockUserService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  createOne: jest.fn(),
  update: jest.fn(),
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
    it('returns an array of users', async () => {
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
  });

  describe('GET /:id (findOne)', () => {
    const mockUser: UserResponseDto = {
      id: 1,
      name: 'Alice',
      email: 'alice@example.com',
      createdAt: '2026-03-07T19:41:14.688Z',
      updatedAt: '2026-03-07T19:41:14.688Z',
    };

    it('returns a user', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockUser);
      expect(userService.findOne).toHaveBeenCalledWith(1);
      expect(userService.findOne).toHaveBeenCalledTimes(1);
    });

    describe('when user not found', () => {
      it('throws an error', async () => {
        const error = new Error('No User found');
        mockUserService.findOne.mockRejectedValue(error);

        await expect(controller.findOne(999)).rejects.toThrow('No User found');
        expect(userService.findOne).toHaveBeenCalledWith(999);
      });
    });
  });

  describe('PATCH /:id (update)', () => {
    const updateUserDto: UpdateUserDto = { name: 'Alice Updated' };

    const mockUpdatedUser: UserResponseDto = {
      id: 1,
      name: 'Alice Updated',
      email: 'alice@example.com',
      createdAt: '2026-03-07T19:41:14.688Z',
      updatedAt: '2026-03-07T19:41:14.688Z',
    };

    it('returns the updated user', async () => {
      mockUserService.update.mockResolvedValue(mockUpdatedUser);

      const result = await controller.update(1, updateUserDto);

      expect(result).toEqual(mockUpdatedUser);
      expect(userService.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(userService.update).toHaveBeenCalledTimes(1);
    });

    it('updates only the provided fields', async () => {
      const partialDto: UpdateUserDto = { email: 'newalice@example.com' };
      const mockPartialUpdate: UserResponseDto = {
        ...mockUpdatedUser,
        email: 'newalice@example.com',
      };
      mockUserService.update.mockResolvedValue(mockPartialUpdate);

      const result = await controller.update(1, partialDto);

      expect(result).toEqual(mockPartialUpdate);
      expect(userService.update).toHaveBeenCalledWith(1, partialDto);
    });

    describe('when user not found', () => {
      it('throws an error', async () => {
        const error = new Error('No User found');
        mockUserService.update.mockRejectedValue(error);

        await expect(controller.update(999, updateUserDto)).rejects.toThrow(
          'No User found',
        );
        expect(userService.update).toHaveBeenCalledWith(999, updateUserDto);
      });
    });
  });

  describe('POST / (create)', () => {
    const createUserDto: CreateUserDto = {
      name: 'Alice',
      email: 'alice@example.com',
    };

    const mockCreatedUser: UserResponseDto = {
      id: 1,
      name: 'Alice',
      email: 'alice@example.com',
      createdAt: '2026-03-07T19:41:14.688Z',
      updatedAt: '2026-03-07T19:41:14.688Z',
    };

    it('returns the created user', async () => {
      mockUserService.createOne.mockResolvedValue(mockCreatedUser);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(mockCreatedUser);
      expect(userService.createOne).toHaveBeenCalledWith(createUserDto);
      expect(userService.createOne).toHaveBeenCalledTimes(1);
    });

    describe('when creation fails', () => {
      it('throws an error', async () => {
        const error = new Error('Unique constraint violation');
        mockUserService.createOne.mockRejectedValue(error);

        await expect(controller.create(createUserDto)).rejects.toThrow(
          'Unique constraint violation',
        );
        expect(userService.createOne).toHaveBeenCalledWith(createUserDto);
      });
    });
  });
});
