import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      log: [
        {
          level: 'query',
          emit: 'stdout',
        },
      ],
    });
  }

  onModuleInit() {
    this.$connect();
  }
}
