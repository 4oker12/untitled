import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      graphql: '/graphql',
      endpoints: ['GET /health', 'GET /debug', 'GET /users', 'GET /users/:id'],
    };
  }
}
