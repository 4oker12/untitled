import { Controller, Get, Param, ParseIntPipe, Query, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersQueryDto } from './dto/users-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from './models/role.enum';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll(@Query() query: UsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request & { user: { id: number; role: string } }) {
    // Check if user is admin or accessing their own profile
    const user = req.user;
    if (user.role === Role.ADMIN || user.id === id) {
      return this.usersService.findOne(id);
    }
    throw new ForbiddenException('You can only access your own profile');
  }
}
