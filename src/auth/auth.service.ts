import * as bcrypt from 'bcrypt';
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService, Role } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { LoginDto } from './dto/login.dto';
import { Verify2faDto } from './dto/verify-2fa.dto';

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

  async login(dto: LoginDto) {
    const { email, password } = dto;

    const user = this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new BadRequestException('Email not verified');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    user.twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString();

    console.log('2FA CODE:', user.twoFactorCode);

    return {
      message: 'Login successful. Check your email for the 2FA code.',
    };
  }
  verify2fa(dto: Verify2faDto) {
    const { email, code } = dto;

    const user = this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    if (user.twoFactorCode !== code) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    // On invalide le code après utilisation
    user.twoFactorCode = undefined;

    return {
      message: '2FA success (next step: JWT)',
    };
  }
}
