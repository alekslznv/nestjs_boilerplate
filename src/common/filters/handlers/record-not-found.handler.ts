import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { Response } from 'express';
import { PrismaErrorHandler } from '../../interfaces/prisma-error-handler.interface';

@Injectable()
export class RecordNotFoundHandler implements PrismaErrorHandler {
  canHandle(code: string): boolean {
    return code === 'P2025';
  }

  handle(
    error: Prisma.PrismaClientKnownRequestError,
    response: Response,
  ): void {
    response.status(HttpStatus.NOT_FOUND).json({
      statusCode: HttpStatus.NOT_FOUND,
      message: error.meta?.cause ?? 'Record not found',
      error: 'Not Found',
    });
  }
}
