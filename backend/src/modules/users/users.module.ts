import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { UsersController } from './users.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  providers: [UsersService, UsersResolver, PrismaService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
