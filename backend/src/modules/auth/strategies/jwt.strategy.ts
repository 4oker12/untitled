import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as PassportJwt from 'passport-jwt';
const { ExtractJwt, Strategy } = PassportJwt;
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
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
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_SECRET') ?? configService.get('JWT_SECRET') ?? 'devsecret',
    });
  }

  async validate(payload: { sub: number }) {
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      return null;
    }
    // Return a consistent user object structure with userId property
    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
  }
}
