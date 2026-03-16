import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from 'src/generated/prisma/client';
import { UpdateRefreshTokenDto } from './dto/update-refresh-token.dto';

@Injectable()
export class UsersService {
  constructor(private readonly dbService: PrismaService) {}

  async findAll(): Promise<User[]> {
    return await this.dbService.db.user.findMany();
  }

  async findOne(id: number): Promise<User> {
    return await this.dbService.db.user.findUniqueOrThrow({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.dbService.db.user.findFirst({
      where: { email: email },
    });
  }

  async createOne(createUserDto: CreateUserDto): Promise<User> {
    return await this.dbService.db.user.create({
      data: createUserDto,
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    return await this.dbService.db.user.update({
      where: { id },
      data: { ...updateUserDto },
    });
  }

  async remove(id: number): Promise<void> {
    await this.dbService.db.user.deleteMany({
      where: { id },
    });
  }

  async updateRefreshToken(
    id: number,
    updateRefreshTokenDto: UpdateRefreshTokenDto,
  ): Promise<User> {
    return await this.dbService.db.user.update({
      where: { id },
      data: { ...updateRefreshTokenDto },
    });
  }
}
