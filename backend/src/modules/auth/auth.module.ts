import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthResolver } from './auth.resolver';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get('COMMON_JWT_SECRET') || 'devsecret',
        signOptions: { expiresIn: '7d' },
      }),
    }),
    forwardRef(() => UsersModule),
  ],
  providers: [AuthResolver],
})
export class AuthModule {}
