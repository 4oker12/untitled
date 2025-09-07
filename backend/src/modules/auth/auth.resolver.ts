import { Resolver, Mutation, Args, ObjectType, Field } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@ObjectType()
class AuthPayload {
  @Field()
  token!: string;
}

@Resolver()
export class AuthResolver {
  constructor(private jwt: JwtService, private users: UsersService) {}

  // Demo login: returns token for the first user
  @Mutation(() => AuthPayload)
  async login(@Args('email') email: string) {
    const page = await this.users.findAll({ skip: 0, take: 50, order: 'id:asc' } as any);
    const user = page.items.find((u) => u.email === email) || page.items[0];
    const token = this.jwt.sign({ sub: user?.id });
    return { token };
  }
}
