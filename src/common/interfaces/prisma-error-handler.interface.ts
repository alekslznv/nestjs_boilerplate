import { Prisma } from '../../generated/prisma/client';
import { Response } from 'express';

export interface PrismaErrorHandler {
  canHandle(code: string): boolean;
  handle(error: Prisma.PrismaClientKnownRequestError, response: Response): void;
}
