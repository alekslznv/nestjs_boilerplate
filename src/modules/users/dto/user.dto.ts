import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserDto {
  @Expose()
  readonly id!: number;

  @Expose()
  @IsNotEmpty()
  @IsEmail()
  readonly email!: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  readonly name!: string;
}
