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
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const { email, password } = dto;

    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new BadRequestException('Email already used');
    }

    const hashed = await bcrypt.hash(password, 10);

    const emailCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await this.usersService.create({
      email,
      password: hashed,
      role: email === 'admin@test.com' ? Role.ADMIN : Role.USER,
      isEmailVerified: false,
      emailCode,
    });

    console.log('EMAIL CODE:', user.emailCode);

    return {
      message: 'User created. Check email for verification code.',
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const { email, code } = dto;

    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailCode !== code) {
      throw new BadRequestException('Invalid code');
    }

    await this.usersService.verifyEmail(email);

    return {
      message: 'Email verified successfully',
    };
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;

    const user = await this.usersService.findByEmail(email);

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

    const twoFactorCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    await this.usersService.setTwoFactorCode(user.id, twoFactorCode);

    console.log('2FA CODE:', twoFactorCode);

    return {
      message: 'Login successful. Check your email for the 2FA code.',
    };
  }

  async verify2fa(dto: Verify2faDto) {
    const { email, code } = dto;

    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    if (user.twoFactorCode !== code) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    await this.usersService.clearTwoFactorCode(user.id);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
