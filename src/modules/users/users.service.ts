import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from '../prisma/prisma.service';
import { UserResponseDto } from './dto/user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly dbService: PrismaService) {}

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.dbService.db.user.findMany();

    return plainToInstance(UserResponseDto, users);
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.dbService.db.user.findUniqueOrThrow({
      where: { id },
    });

    return plainToInstance(UserResponseDto, user);
  }

  async createOne(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.dbService.db.user.create({
      data: createUserDto,
    });

    return plainToInstance(UserResponseDto, user);
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const result = await this.dbService.db.user.update({
      where: { id },
      data: { ...updateUserDto },
    });

    return plainToInstance(UserResponseDto, result);
  }

  async remove(id: number): Promise<void> {
    await this.dbService.db.user.deleteMany({
      where: { id },
    });
  }
}
