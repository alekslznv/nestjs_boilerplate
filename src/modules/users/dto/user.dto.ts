import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email!: string;
  
  @IsNotEmpty()
  @IsString()
  readonly name!: string;
}