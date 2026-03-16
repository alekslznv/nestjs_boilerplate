import { Expose, Transform } from 'class-transformer';

export class BaseResponseDto {
  @Expose()
  @Transform(({ value }: { value: Date }) => value?.toISOString())
  createdAt!: Date;

  @Expose()
  @Transform(({ value }: { value: Date }) => value?.toISOString())
  updatedAt!: Date;
}
