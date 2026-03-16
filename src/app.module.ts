import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { PrismaModule } from './modules/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { UniqueConstraintHandler } from './common/filters/handlers/unique-constraint.handler';
import { RecordNotFoundHandler } from './common/filters/handlers/record-not-found.handler';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
  ],
  providers: [
    UniqueConstraintHandler,
    RecordNotFoundHandler,
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule {}
