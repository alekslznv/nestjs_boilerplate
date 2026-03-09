import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserDto {
  readonly id!: number;

  @IsNotEmpty()
  @IsEmail()
  readonly email!: string;

  @IsNotEmpty()
  @IsString()
  readonly name!: string;
}
