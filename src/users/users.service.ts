import { Injectable } from '@nestjs/common';
import { Prisma, Role, type User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export { Role };
export type { User };

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  verifyEmail(email: string): Promise<User> {
    return this.prisma.user.update({
      where: { email },
      data: {
        isEmailVerified: true,
        emailCode: null,
      },
    });
  }

  setTwoFactorCode(userId: number, code: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorCode: code },
    });
  }

  clearTwoFactorCode(userId: number): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorCode: null },
    });
  }
}
