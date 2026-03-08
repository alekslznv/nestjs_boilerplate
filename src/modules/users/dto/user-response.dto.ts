import { IntersectionType } from '@nestjs/mapped-types';
import { UserDto } from './user.dto';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';

export class UserResponseDto extends IntersectionType(
  UserDto,
  BaseResponseDto,
) {}
