import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Bookshelf, Role, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookshelfDto } from './dto/create-bookshelf.dto';
import { UpdateBookshelfDto } from './dto/update-bookshelf.dto';

@Injectable()
export class BookshelfService {
  constructor(private readonly prisma: PrismaService) {}

  async createMyBookshelf(
    user: User,
    dto: CreateBookshelfDto,
  ): Promise<Bookshelf> {
    return this.prisma.bookshelf.create({
      data: {
        userId: user.id,
        name: dto.name,
      },
    });
  }

  getMyBookshelves(user: User) {
    return this.prisma.bookshelf.findMany({
      where: {
        userId: user.id,
      },
      include: {
        books: {
          orderBy: { id: 'desc' },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  async getMyBookshelfById(id: number, user: User) {
    const bookshelf = await this.prisma.bookshelf.findUnique({
      where: { id },
      include: {
        books: {
          orderBy: { id: 'desc' },
        },
      },
    });

    if (!bookshelf) {
      throw new NotFoundException('Bookshelf not found');
    }

    if (bookshelf.userId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('You cannot access this bookshelf');
    }

    return bookshelf;
  }

  async updateMyBookshelf(id: number, user: User, dto: UpdateBookshelfDto) {
    const bookshelf = await this.prisma.bookshelf.findUnique({ where: { id } });

    if (!bookshelf) {
      throw new NotFoundException('Bookshelf not found');
    }

    if (bookshelf.userId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('You cannot update this bookshelf');
    }

    return this.prisma.bookshelf.update({
      where: { id },
      data: { name: dto.name },
      include: {
        books: true,
      },
    });
  }

  async removeBookshelf(id: number, user: User) {
    const bookshelf = await this.prisma.bookshelf.findUnique({ where: { id } });

    if (!bookshelf) {
      throw new NotFoundException('Bookshelf not found');
    }

    if (bookshelf.userId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('You cannot delete this bookshelf');
    }

    return this.prisma.bookshelf.delete({
      where: { id },
      include: {
        books: true,
      },
    });
  }

  findAll() {
    return this.prisma.bookshelf.findMany({
      orderBy: { id: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        books: {
          orderBy: { id: 'desc' },
        },
      },
    });
  }
}
