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
}
