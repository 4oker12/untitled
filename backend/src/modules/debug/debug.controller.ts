import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Controller('debug')
export class DebugController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async info() {
    const userCount = await this.prisma.user.count().catch(() => 0);
    const latestUsers = await this.prisma.user
      .findMany({ take: 3, orderBy: { id: 'desc' } })
      .catch(() => []);
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      graphql: '/graphql',
      endpoints: ['GET /health', 'GET /debug', 'GET /users', 'GET /users/:id'],
      db: { provider: 'sqlite', file: 'backend/prisma/dev.db' },
      users: { count: userCount, sample: latestUsers },
    };
  }
}
