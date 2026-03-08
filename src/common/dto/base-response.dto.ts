import { Transform } from 'class-transformer';

export class BaseResponseDto {
  @Transform(({ value }) => value?.toISOString())
  createdAt!: string;

  @Transform(({ value }) => value?.toISOString())
  updatedAt!: string;
}
