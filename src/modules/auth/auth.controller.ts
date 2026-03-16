import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { AuthService } from './auth.service';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import type { User } from 'src/generated/prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UpdateTokensDto } from './dto/update-access-token.dto';
import { TokenPairDto } from './dto/token-pair.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Serialize(UserResponseDto)
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.authService.register(createUserDto);
  }

  @UseGuards(AuthGuard('local'))
  @Post('signin')
  async login(@CurrentUser() user: User): Promise<TokenPairDto> {
    return await this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@CurrentUser() user: User): Promise<void> {
    await this.authService.logout(user.id);
  }

  @Post('refresh')
  async refreshToken(
    @Body() updateTokensDto: UpdateTokensDto,
  ): Promise<TokenPairDto> {
    return await this.authService.updateTokens(updateTokensDto.refreshToken);
  }
}
