import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected getRequestResponse(context: ExecutionContext) {
    if (context.getType<GqlContextType>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const ctx = gqlCtx.getContext<{ req?: any; res?: any }>();

      // Get req and res from GraphQL context
      const req = ctx?.req;
      const res = ctx?.res;

      // If both req and res are available, return them
      if (req && res) {
        return { req, res };
      }

      // If only req is available, try to get res from HTTP context
      if (req) {
        const httpRes = context.switchToHttp().getResponse();
        return { req, res: httpRes || res };
      }

      // Fallback to HTTP context
      const httpReq = context.switchToHttp().getRequest();
      const httpRes = context.switchToHttp().getResponse();
      return { req: httpReq, res: httpRes };
    }

    // Default HTTP handling
    return super.getRequestResponse(context);
  }

  // Override the getTracker method to handle undefined request objects
  protected getTracker(req: Record<string, any>): Promise<string> {
    // If req is undefined or doesn't have an ip property, use a default value
    if (!req || !req.ip) {
      // Use a default tracker value for GraphQL requests without IP
      return Promise.resolve('graphql-no-ip');
    }
    return Promise.resolve(req.ip);
  }
}
