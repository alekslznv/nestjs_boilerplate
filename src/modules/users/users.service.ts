import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';

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
}
