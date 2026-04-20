import { Injectable } from '@nestjs/common';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: number;
  email: string;
  password: string;
  role: Role;
  isEmailVerified: boolean;
  emailCode?: string;
  twoFactorCode?: string;
}

@Injectable()
export class UsersService {
  private readonly users: User[] = [];

  create(user: User): User {
    this.users.push(user);
    return user;
  }

  findByEmail(email: string): User | undefined {
    return this.users.find((user) => user.email === email);
  }

  verifyEmail(email: string) {
    const user = this.findByEmail(email);

    if (!user) return null;

    user.isEmailVerified = true;
    user.emailCode = undefined;

    return user;
  }

  findById(id: number) {
    return this.users.find((user) => user.id === id);
  }
}
