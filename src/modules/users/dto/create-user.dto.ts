import { PickType } from '@nestjs/mapped-types';
import { UserDto } from './user.dto';
import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Role } from 'src/generated/prisma/enums';

export class CreateUserDto extends PickType(UserDto, [
  'email',
  'name',
] as const) {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @IsEnum(Role)
  role!: Role;
}
