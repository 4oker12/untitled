import { Module } from '@nestjs/common';
import { DebugController } from './debug.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({ controllers: [DebugController], providers: [PrismaService] })
export class DebugModule {}
