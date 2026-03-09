import { Transform } from 'class-transformer';

export class BaseResponseDto {
  @Transform(({ value }: { value: Date }) => value?.toISOString())
  createdAt!: string;

  @Transform(({ value }: { value: Date }) => value?.toISOString())
  updatedAt!: string;
}
