import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { ConfigModule } from '@nestjs/config';
import { Request } from 'express';
import { DebugModule } from './modules/debug/debug.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './common/prisma.module';
import { CustomThrottlerGuard } from './common/custom-throttler.guard';
import { depthLimit } from 'graphql-depth-limit';
import { createComplexityLimitRule } from 'graphql-validation-complexity';
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginUsageReporting,
} from '@apollo/server/plugin/landingPage/default';
import responseCachePlugin from 'apollo-server-plugin-response-cache';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      sortSchema: true,
      context: ({ req, res }: { req: Request; res: any }) => ({ req, res }),
      // Disable playground and introspection in production
      playground: process.env.NODE_ENV !== 'production',
      introspection: process.env.NODE_ENV !== 'production',
      // Add depth and complexity limits
      validationRules: [
        // Limit query depth to 7 levels
        depthLimit(7),
        // Limit query complexity to 1000
        createComplexityLimitRule(1000),
      ],
      // Enable HTTP batching
      plugins: [
        ApolloServerPluginLandingPageLocalDefault({
          embed: true,
          includeCookies: true,
        }),
        // Enable Automatic Persisted Queries (APQ)
        ApolloServerPluginUsageReporting({
          sendVariableValues: { all: true },
          sendHeaders: { all: true },
          sendReportsImmediately: true,
          rewriteError: (err) => {
            // Mask error details in production
            return process.env.NODE_ENV === 'production'
              ? new Error('Internal server error')
              : err;
          },
        }),
        // Enable response caching
        responseCachePlugin(),
      ],
      // Enable compression
      cors: false, // Handled by NestJS
      // Enable keep-alive
      persistedQueries: {
        ttl: 900, // 15 minutes
      },
      cache: 'bounded',
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 10 }],
    }),
    PrismaModule,
    DebugModule,
    UsersModule,
    AuthModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
