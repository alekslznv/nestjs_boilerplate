import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { Response } from 'express';
import { PrismaErrorHandler } from '../../interfaces/prisma-error-handler.interface';

@Injectable()
export class UniqueConstraintHandler implements PrismaErrorHandler {
  canHandle(code: string): boolean {
    return code === 'P2002';
  }

  handle(
    error: Prisma.PrismaClientKnownRequestError,
    response: Response,
  ): void {
    const fields = (error.meta?.target as string[])?.join(', ') ?? 'field';
    response.status(HttpStatus.CONFLICT).json({
      statusCode: HttpStatus.CONFLICT,
      message: `Unique constraint violation on: ${fields}`,
      error: 'Conflict',
    });
  }
}
