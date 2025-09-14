import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as PassportJwt from 'passport-jwt';
const { ExtractJwt, Strategy } = PassportJwt;
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
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
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_REFRESH_SECRET') || 'refreshsecret',
      passReqToCallback: true,
    });
  }

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
}
