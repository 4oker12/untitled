import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { Role } from './role.enum';

@ObjectType()
export class User {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  email!: string;

  @Field(() => String, { nullable: true })
  name?: string | null;

  @Field(() => Role)
  role!: Role;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;
}
