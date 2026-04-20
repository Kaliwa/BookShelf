import * as bcrypt from 'bcrypt';
import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService, Role } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async register(dto: RegisterDto) {
    const { email, password } = dto;

    const existingUser = this.usersService.findByEmail(email);

    if (existingUser) {
      throw new BadRequestException('Email already used');
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = {
      id: Date.now(),
      email,
      password: hashed,
      role: Role.USER,
      isEmailVerified: false,
      emailCode: Math.floor(100000 + Math.random() * 900000).toString(),
    };

    this.usersService.create(user);

    console.log('EMAIL CODE:', user.emailCode);

    return {
      message: 'User created. Check email for verification code.',
    };
  }

  verifyEmail(dto: VerifyEmailDto) {
    const { email, code } = dto;

    const user = this.usersService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailCode !== code) {
      throw new BadRequestException('Invalid code');
    }

    this.usersService.verifyEmail(email);

    return {
      message: 'Email verified successfully',
    };
  }
}
