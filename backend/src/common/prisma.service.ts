import { INestApplication, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();

    // Prefer process signal hooks over Prisma $on('beforeExit') to avoid TS typing issues and ensure graceful shutdown
    process.on('beforeExit', async () => {
      await this.$disconnect().catch(() => undefined);
    });
    process.on('SIGINT', async () => {
      await this.$disconnect().catch(() => undefined);
      process.exit(0);
    });
    process.on('SIGTERM', async () => {
      await this.$disconnect().catch(() => undefined);
      process.exit(0);
    });
  }

  // Keep Nest-specific hook for app-driven shutdowns
  async enableShutdownHooks(app: INestApplication) {
    // Close Nest app on shutdown signals
    process.on('SIGINT', async () => {
      await app.close().catch(() => undefined);
    });
    process.on('SIGTERM', async () => {
      await app.close().catch(() => undefined);
    });
  }

  async onModuleDestroy() {
    await this.$disconnect().catch(() => undefined);
  }
}
