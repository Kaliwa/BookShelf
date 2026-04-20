import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

interface AuthenticatedUser {
  password?: string;
  emailCode?: string;
  twoFactorCode?: string;
  [key: string]: unknown;
}

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  @ApiOperation({ summary: 'Get current authenticated user' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: Request & { user: AuthenticatedUser }) {
    const userWithoutSensitiveData = { ...req.user };
    delete userWithoutSensitiveData.password;
    delete userWithoutSensitiveData.emailCode;
    delete userWithoutSensitiveData.twoFactorCode;

    return userWithoutSensitiveData;
  }
}
