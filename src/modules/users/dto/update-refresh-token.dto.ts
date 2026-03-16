import { IsOptional, IsString } from 'class-validator';
import { Argon2Hash } from 'src/common/types/argon2-hash.type';

export class UpdateRefreshTokenDto {
  @IsString()
  @IsOptional()
  refreshToken!: Argon2Hash | null;
}
