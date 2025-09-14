import { Resolver, Mutation, Query, Args, ObjectType, Field, InputType, ArgsType } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/models/user.model';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UnauthorizedException } from '@nestjs/common';
import { IsEmail, MinLength } from 'class-validator';

@ObjectType()
class AuthPayload {
  @Field()
  accessToken!: string;

  @Field()
  refreshToken!: string;

  @Field(() => User)
  user!: User;
}

@ObjectType()
class TokenPair {
  @Field()
  accessToken!: string;

  @Field()
  refreshToken!: string;
}

@InputType()
class LoginInput {
  @Field()
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email!: string;

  @Field()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;
}

@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private usersService: UsersService
  ) {}

  @Mutation(() => AuthPayload)
  async login(
    @Args('input') input: LoginInput
  ) {
    const user = await this.authService.validateUser(input.email, input.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken, refreshToken } = await this.authService.login(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        ...user,
        id: String(user.id),
        createdAt: new Date(user.createdAt)
      }
    };
  }

  @Query(() => User, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: any) {
    if (!user || !user.userId) {
      return null;
    }

    const userData = await this.usersService.findOne(user.userId);

    if (!userData) {
      return null;
    }

    return {
      ...userData,
      id: String(userData.id),
      createdAt: new Date(userData.createdAt)
    };
  }

  @Mutation(() => TokenPair)
  async refreshTokens(@Args('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: any) {
    if (!user || !user.userId) {
      throw new UnauthorizedException('Not authenticated');
    }

    await this.authService.logout(user.userId);
    return true;
  }
}
