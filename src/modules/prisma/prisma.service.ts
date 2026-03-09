import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { createPrismaClient } from '../../../prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  readonly db: PrismaClient;

  constructor() {
    this.db = createPrismaClient();
  }

  async onModuleInit() {
    await this.db.$connect();
  }
  async onModuleDestroy() {
    await this.db.$disconnect();
  }
}
