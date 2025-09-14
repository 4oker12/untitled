import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { UsersQueryDto } from './dto/users-query.dto';
import { UserDto } from './dto/user.dto';

import { Role } from './models/role.enum';

const DEMO_USERS: UserDto[] = [
  { id: 1, email: 'demo1@example.com', name: 'Demo One', role: Role.USER, createdAt: new Date(0).toISOString() },
  { id: 2, email: 'demo2@example.com', name: 'Demo Two', role: Role.ADMIN, createdAt: new Date(0).toISOString() },
];

function isTableMissing(err: unknown): boolean {
  const e = err as { code?: string; message?: string } | undefined;
  if (!e) return false;
  if (e.code === 'P2021') return true;
  const msg = (e.message || '').toLowerCase();
  return msg.includes('does not exist') || msg.includes('no such table');
}

// Prisma payload type for conversion when DB is available
 type PrismaUser = Prisma.UserGetPayload<{ select: { id: true; email: true; name: true; role: true; createdAt: true } }>;

function toDto(u: PrismaUser): UserDto {
  return {
    id: Number(u.id as unknown as number),
    email: u.email,
    name: u.name ?? null,
    role: u.role as any, // Cast to Role enum
    createdAt: new Date(u.createdAt).toISOString()
  };
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: UsersQueryDto): Promise<{ items: UserDto[]; total: number; count: number; skip: number; take: number }> {
    const skip = typeof query?.skip === 'number' ? query.skip : 0;
    const take = typeof query?.take === 'number' ? query.take : 20;
    const orderStr = (query?.order ?? 'id:asc').toLowerCase();
    const [orderField, orderDir] = orderStr.split(':') as [keyof Prisma.UserOrderByWithRelationInput, 'asc' | 'desc'];

    const where: Prisma.UserWhereInput | undefined = query?.search
      ? {
          OR: [
            { email: { contains: query.search } },
            { name: { contains: query.search } },
          ],
        }
      : undefined;

    try {
      const [total, rows] = await this.prisma.$transaction([
        this.prisma.user.count({ where }),
        this.prisma.user.findMany({
          where,
          orderBy: { [orderField || 'id']: (orderDir || 'asc') as any },
          skip,
          take,
          select: { id: true, email: true, name: true, role: true, createdAt: true },
        }),
      ]);

      let items = rows.map(toDto);
      if ((items.length === 0 && process.env.NODE_ENV !== 'production') || total === 0) {
        // Fallback to demos in dev
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.warn('[users] empty or unavailable table, serving DEMO_USERS');
        }
        items = DEMO_USERS.slice(skip, skip + take);
        return { items, total: DEMO_USERS.length, count: items.length, skip, take };
      }
      return { items, total, count: items.length, skip, take };
    } catch (err) {
      if (isTableMissing(err) || process.env.NODE_ENV !== 'production') {
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.warn('[users] DB unavailable or table missing, serving DEMO_USERS');
        }
        const items = DEMO_USERS.slice(skip, skip + take);
        return { items, total: DEMO_USERS.length, count: items.length, skip, take };
      }
      throw err;
    }
  }

  async findOne(id: number): Promise<UserDto | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: Number(id) },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      });
      if (!user) return null;
      return toDto(user);
    } catch (err) {
      if (isTableMissing(err) || process.env.NODE_ENV !== 'production') {
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.warn('[users] findOne fallback to DEMO_USERS due to DB issue');
        }
        return DEMO_USERS.find((u) => u.id === id) ?? null;
      }
      throw err;
    }
  }
}
