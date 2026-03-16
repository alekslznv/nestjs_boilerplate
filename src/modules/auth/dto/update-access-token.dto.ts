import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTokensDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
