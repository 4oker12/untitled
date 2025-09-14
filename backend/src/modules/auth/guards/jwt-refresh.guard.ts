import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  getRequest(context: ExecutionContext) {
    // Check if it's a GraphQL context
    if (context.getType<GqlContextType>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const ctx = gqlCtx.getContext<{ req?: any }>();
      if (ctx?.req) return ctx.req; // GraphQL
    }

    // HTTP fallback
    return context.switchToHttp().getRequest();
  }
}
