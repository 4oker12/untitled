import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma.service';
import { UsersService } from '../users/users.service';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  async register(email: string, password: string, name?: string) {
    // Check if user exists
    const userExists = await this.prisma.user.findUnique({
      where: { email },
    });
    if (userExists) {
      throw new ForbiddenException('Email already registered');
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
    });

    return { id: user.id, email: user.email, name: user.name };
  }

  async validateUser(email: string, password: string) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return null;
    }

    // Verify password
    const passwordValid = await this.verifyPassword(user.passwordHash, password);
    if (!passwordValid) {
      return null;
    }

    return { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt };
  }

  async login(userId: number) {
    const tokens = await this.getTokens(userId);
    await this.storeRefreshToken(userId, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: number) {
    // Delete all refresh tokens for user
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async getUserIdFromRefreshToken(refreshToken: string): Promise<number> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET') ?? 'refreshsecret',
      });
      return payload.sub;
    } catch (error) {
      throw new ForbiddenException('Invalid refresh token');
    }
  }

  async refreshTokens(refreshToken: string) {
    try {
      // Extract userId from refresh token
      const userId = await this.getUserIdFromRefreshToken(refreshToken);

      // Find user
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { refreshTokens: true },
      });
      if (!user) {
        throw new ForbiddenException('Access denied');
      }

      // Find refresh token
      const storedRefreshToken = await this.prisma.refreshToken.findFirst({
        where: { userId },
      });

      if (!storedRefreshToken) {
        throw new ForbiddenException('Access denied');
      }

      // Verify token hash
      const tokensMatch = await this.verifyData(storedRefreshToken.tokenHash, refreshToken);
      if (!tokensMatch) {
        throw new ForbiddenException('Access denied');
      }

      // Check if token is expired
      if (new Date(storedRefreshToken.expiresAt) < new Date()) {
        await this.prisma.refreshToken.delete({
          where: { id: storedRefreshToken.id },
        });
        throw new ForbiddenException('Refresh token expired');
      }

      // Generate new tokens
      const tokens = await this.getTokens(user.id);

      // Update refresh token (rotation)
      await this.updateRefreshToken(storedRefreshToken.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      throw new ForbiddenException('Invalid refresh token');
    }
  }

  async getUserFromToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_ACCESS_SECRET') ?? this.configService.get('JWT_SECRET') ?? 'devsecret',
      });
      const userId = payload.sub;
      return this.usersService.findOne(userId);
    } catch {
      return null;
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  private async verifyPassword(hash: string, plain: string): Promise<boolean> {
    return argon2.verify(hash, plain);
  }

  private async hashData(data: string): Promise<string> {
    return argon2.hash(data);
  }

  private async verifyData(hash: string, plain: string): Promise<boolean> {
    return argon2.verify(hash, plain);
  }

  private async getTokens(userId: number) {
    // Get the user to include role in the token
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          role: user.role
        },
        {
          secret: this.configService.get('JWT_ACCESS_SECRET') ?? this.configService.get('JWT_SECRET') ?? 'devsecret',
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          role: user.role
        },
        {
          secret: this.configService.get('JWT_REFRESH_SECRET') || 'refreshsecret',
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async storeRefreshToken(userId: number, refreshToken: string) {
    const refreshTokenHash = await this.hashData(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    // Delete any existing refresh tokens for this user
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    // Create new refresh token
    await this.prisma.refreshToken.create({
      data: {
        id: randomUUID(),
        userId,
        tokenHash: refreshTokenHash,
        expiresAt,
      },
    });
  }

  private async updateRefreshToken(tokenId: string, refreshToken: string) {
    const refreshTokenHash = await this.hashData(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await this.prisma.refreshToken.update({
      where: { id: tokenId },
      data: {
        tokenHash: refreshTokenHash,
        expiresAt,
      },
    });
  }
}
