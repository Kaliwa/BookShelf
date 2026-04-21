import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Book, Role, User, type Bookshelf } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  private async getDefaultBookshelf(user: User): Promise<Bookshelf> {
    const existing = await this.prisma.bookshelf.findFirst({
      where: { userId: user.id },
      orderBy: { id: 'asc' },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.bookshelf.create({
      data: {
        userId: user.id,
        name: `${user.email.split('@')[0]}'s bookshelf`,
      },
    });
  }

  async create(dto: CreateBookDto, user: User): Promise<Book> {
    let bookshelf = await this.getDefaultBookshelf(user);

    if (dto.bookshelfId) {
      const selected = await this.prisma.bookshelf.findUnique({
        where: { id: dto.bookshelfId },
      });

      if (!selected || selected.userId !== user.id) {
        throw new BadRequestException('Invalid bookshelf');
      }

      bookshelf = selected;
    }

    return this.prisma.book.create({
      data: {
        title: dto.title,
        author: dto.author,
        status: dto.status,
        bookshelfId: bookshelf.id,
      },
    });
  }

  findMyBooks(user: User, bookshelfId?: number): Promise<Book[]> {
    return this.prisma.book.findMany({
      where: {
        bookshelf: {
          userId: user.id,
          ...(bookshelfId ? { id: bookshelfId } : {}),
        },
      },
      orderBy: { id: 'desc' },
    });
  }

  findAll(): Promise<Book[]> {
    return this.prisma.book.findMany({
      orderBy: { id: 'desc' },
      include: {
        bookshelf: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: number, dto: UpdateBookDto, user: User): Promise<Book> {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        bookshelf: true,
      },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (book.bookshelf.userId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('You cannot update this book');
    }

    let bookshelfId = dto.bookshelfId;
    if (bookshelfId !== undefined) {
      const selected = await this.prisma.bookshelf.findUnique({
        where: { id: bookshelfId },
      });

      if (
        !selected ||
        (selected.userId !== user.id && user.role !== Role.ADMIN)
      ) {
        throw new BadRequestException('Invalid bookshelf');
      }

      bookshelfId = selected.id;
    }

    return this.prisma.book.update({
      where: { id },
      data: {
        title: dto.title,
        author: dto.author,
        status: dto.status,
        ...(bookshelfId !== undefined ? { bookshelfId } : {}),
      },
    });
  }

  async remove(id: number, user: User): Promise<Book> {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        bookshelf: true,
      },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (book.bookshelf.userId !== user.id && user.role !== Role.ADMIN) {
      throw new ForbiddenException('You cannot delete this book');
    }

    return this.prisma.book.delete({
      where: { id },
    });
  }
}
