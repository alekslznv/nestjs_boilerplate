import * as argon2 from 'argon2';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from 'src/generated/prisma/client';
import { toArgon2Hash } from 'src/common/types/argon2-hash.type';
import { ACCESS_JWT, REFRESH_JWT } from './providers/jwt.providers';
import { TokenPairDto } from './dto/token-pair.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    @Inject(ACCESS_JWT) private readonly accessJwt: JwtService,
    @Inject(REFRESH_JWT) private readonly refreshJwt: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = toArgon2Hash(
      await argon2.hash(createUserDto.password),
    );

    return await this.userService.createOne({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  async login(user: User): Promise<TokenPairDto> {
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.accessJwt.sign(payload);
    const refreshToken = this.refreshJwt.sign(payload);
    const hashedToken = toArgon2Hash(await argon2.hash(refreshToken));

    await this.userService.updateRefreshToken(user.id, {
      refreshToken: hashedToken,
    });

    return { accessToken, refreshToken };
  }

  async logout(userId: number): Promise<void> {
    await this.userService.updateRefreshToken(userId, { refreshToken: null });
  }

  async updateTokens(refreshToken: string): Promise<TokenPairDto> {
    let inputPayload: { sub: number; email: string };
    try {
      inputPayload = await this.refreshJwt.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userService.findOne(inputPayload['sub']);
    if (!user.refreshToken) throw new UnauthorizedException();

    if (await argon2.verify(user.refreshToken, refreshToken)) {
      const payload = { email: user.email, sub: user.id };
      const updatedRefreshToken = this.refreshJwt.sign(payload);
      const hashedUpdatedRefreshToken = toArgon2Hash(
        await argon2.hash(updatedRefreshToken),
      );
      await this.userService.updateRefreshToken(user.id, {
        refreshToken: hashedUpdatedRefreshToken,
      });

      return {
        accessToken: this.accessJwt.sign(payload),
        refreshToken: updatedRefreshToken,
      };
    } else {
      throw new UnauthorizedException();
    }
  }

  async validatePassword(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.userService.findByEmail(email);
    if (!user) return null;

    const storedHash = toArgon2Hash(user.password);
    const result = await argon2.verify(storedHash, password);
    if (!result) return null;
    return user;
  }
}
