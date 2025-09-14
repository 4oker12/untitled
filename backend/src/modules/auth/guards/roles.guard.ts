import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Role } from '../../users/models/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No roles required, allow access
    }

    // Get user from request based on context type
    let user;

    if (context.getType<GqlContextType>() === 'graphql') {
      // GraphQL context
      const gqlCtx = GqlExecutionContext.create(context);
      const ctx = gqlCtx.getContext<{ req?: any }>();
      user = ctx?.req?.user;
    } else {
      // HTTP context
      const request = context.switchToHttp().getRequest();
      user = request?.user;
    }

    if (!user) {
      throw new ForbiddenException('You are not authenticated');
    }

    const hasRole = requiredRoles.some(role => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }
}
