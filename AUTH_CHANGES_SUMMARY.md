# Authentication Changes Summary

This document summarizes the changes made to fix the authentication and guards for both GraphQL and HTTP endpoints.

## Issue

The original issue was that GraphQL protected resolvers were failing with: "Cannot read properties of undefined (reading 'header')" inside guards/strategies, which meant that the request object (req) was undefined in the GraphQL context.

## Changes Made

### 1. GraphQL Module Configuration

The GraphQLModule was already correctly configured to inject both req and res in the context:

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: 'schema.gql',
  playground: true,
  sortSchema: true,
  context: ({ req, res }: { req: Request; res: any }) => ({ req, res }),
}),
```

### 2. Server Setup (main.ts)

The main.ts file was already correctly configured with CORS and cookie-parser:

```typescript
// Enable CORS for future frontend consumption
app.enableCors({
  origin: ['http://localhost:5173', 'http://localhost:3000', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true
});

// Use cookie-parser middleware
app.use(cookieParser());
```

### 3. Auth Guards

All three auth guards (JwtAuthGuard, LocalAuthGuard, and JwtRefreshGuard) were already correctly implemented to work with both GraphQL and HTTP contexts:

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    // Check if it's a GraphQL context
    if (context.getType() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const ctx = gqlCtx.getContext<{ req?: any }>();
      if (ctx?.req) return ctx.req; // GraphQL
    }

    // HTTP fallback
    return context.switchToHttp().getRequest();
  }
}
```

### 4. RolesGuard

The RolesGuard was already correctly implemented to work with both GraphQL and HTTP contexts:

```typescript
canActivate(context: ExecutionContext): boolean {
  // ...

  // Get user from request based on context type
  let user;

  if (context.getType() === 'graphql') {
    // GraphQL context
    const gqlCtx = GqlExecutionContext.create(context);
    const ctx = gqlCtx.getContext<{ req?: any }>();
    user = ctx?.req?.user;
  } else {
    // HTTP context
    const request = context.switchToHttp().getRequest();
    user = request?.user;
  }

  // ...
}
```

### 5. CustomThrottlerGuard

The CustomThrottlerGuard had several issues that were fixed:

1. Fixed method name from `getrequestResponse` to `getRequestResponse` with the proper `protected` modifier
2. Fixed typo in `GqlexecutionContext` to `GqlExecutionContext`
3. Fixed `switchtoHttp` to `switchToHttp`
4. Removed stray asterisks (*) that were in the code
5. Fixed formatting and indentation

```typescript
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
```

### 6. JwtStrategy

The JwtStrategy was already correctly implemented to safely extract tokens:

```typescript
jwtFromRequest: ExtractJwt.fromExtractors([
  (request) => {
    // Safely extract the token from the Authorization header
    if (!request || typeof request.headers !== 'object') {
      return null;
    }

    // Try to get the Authorization header
    const authHeader = request.headers.authorization ||
                    (request?.header && typeof request.header === 'function' ? request.header('Authorization') : null);

    if (!authHeader) {
      return null;
    }

    // Extract the token from the Bearer scheme
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  },
]),
```

### 7. JwtRefreshStrategy

The JwtRefreshStrategy was updated to safely extract tokens from cookies:

```typescript
jwtFromRequest: ExtractJwt.fromExtractors([
  (request: Request) => {
    // Safely extract the token from cookies
    if (!request || typeof request !== 'object') {
      return null;
    }

    // Check if cookies exist
    if (!request.cookies || typeof request.cookies !== 'object') {
      return null;
    }

    return request.cookies.refresh_token || null;
  },
]),
```

And the validate method was updated to handle the case where the request object might be undefined:

```typescript
async validate(req: Request, payload: { sub: number }) {
  // Safely extract the refresh token from cookies
  if (!req || typeof req !== 'object') {
    throw new UnauthorizedException('Invalid request object');
  }

  // Check if cookies exist
  if (!req.cookies || typeof req.cookies !== 'object') {
    throw new UnauthorizedException('Cookies not available');
  }

  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) {
    throw new UnauthorizedException('Refresh token not found');
  }

  const user = await this.usersService.findOne(payload.sub);
  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    refreshToken,
  };
}
```

## Package Versions

The package versions were already compatible with the requirements:
- @nestjs/graphql: 12.2.1
- @nestjs/apollo: 12.2.1
- @apollo/server: ^4.3.2

## Testing

A comprehensive testing guide has been created in AUTH_TESTING_GUIDE.md to verify that the changes work as expected.

## Conclusion

The main issues were in the CustomThrottlerGuard and JwtRefreshStrategy, which were not properly handling GraphQL context. These issues have been fixed, and the authentication and guards should now work correctly for both GraphQL and HTTP endpoints.
