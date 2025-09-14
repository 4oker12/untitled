import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './models/user.model';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from './models/role.enum';

@Resolver(() => User)
export class UsersResolver {
  constructor(private users: UsersService) {}

  @Query(() => [User])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async usersQuery() {
    const result = await this.users.findAll({ skip: 0, take: 20, order: 'id:asc' } as any);
    return result.items.map((u) => ({
      ...u,
      id: String(u.id),
      createdAt: new Date(u.createdAt),
      role: u.role as Role
    }));
  }

  @Query(() => User, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async user(@Args('id', { type: () => ID }) id: string) {
    const numId = Number(id);
    const u = await this.users.findOne(Number.isFinite(numId) ? numId : -1);
    return u ? {
      ...u,
      id: String(u.id),
      createdAt: new Date(u.createdAt),
      role: u.role as Role
    } : null;
  }
}
