import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '../../generated/prisma/client';
import { PrismaErrorHandler } from '../interfaces/prisma-error-handler.interface';
import { UniqueConstraintHandler } from './handlers/unique-constraint.handler';
import { RecordNotFoundHandler } from './handlers/record-not-found.handler';

@Catch()
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  private readonly prismaHandlers: PrismaErrorHandler[];

  constructor(
    uniqueConstraintHandler: UniqueConstraintHandler,
    recordNotFoundHandler: RecordNotFoundHandler,
  ) {
    this.prismaHandlers = [uniqueConstraintHandler, recordNotFoundHandler];
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const handler = this.prismaHandlers.find((h) =>
        h.canHandle(exception.code),
      );
      if (handler) {
        handler.handle(exception, response);
        return;
      }
      this.logger.error(
        `Unhandled Prisma error [${exception.code}]: ${exception.message}`,
      );
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      });
      return;
    }

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }

    this.logger.error(exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}
