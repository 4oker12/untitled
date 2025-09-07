import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './models/user.model';

@Resolver(() => User)
export class UsersResolver {
  constructor(private users: UsersService) {}

  @Query(() => [User])
  async usersQuery() {
    const result = await this.users.findAll({ skip: 0, take: 20, order: 'id:asc' } as any);
    return result.items.map((u) => ({ ...u, id: String(u.id), createdAt: new Date(u.createdAt) }));
  }

  @Query(() => User, { nullable: true })
  async user(@Args('id', { type: () => ID }) id: string) {
    const numId = Number(id);
    const u = await this.users.findOne(Number.isFinite(numId) ? numId : -1);
    return u ? { ...u, id: String(u.id), createdAt: new Date(u.createdAt) } : null;
  }
}
