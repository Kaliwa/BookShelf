import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Book, User, type Bookshelf } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  private getOrCreateBookshelf(user: User): Promise<Bookshelf> {
    return this.prisma.bookshelf.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        name: `${user.email.split('@')[0]}'s bookshelf`,
      },
    });
  }

  async create(dto: CreateBookDto, user: User): Promise<Book> {
    const bookshelf = await this.getOrCreateBookshelf(user);

    return this.prisma.book.create({
      data: {
        title: dto.title,
        author: dto.author,
        status: dto.status,
        bookshelfId: bookshelf.id,
      },
    });
  }

  findMyBooks(user: User): Promise<Book[]> {
    return this.prisma.book.findMany({
      where: {
        bookshelf: {
          userId: user.id,
        },
      },
      orderBy: { id: 'desc' },
    });
  }

  findAll(): Promise<Book[]> {
    return this.prisma.book.findMany({
      orderBy: { id: 'desc' },
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

    if (book.bookshelf.userId !== user.id) {
      throw new ForbiddenException('You cannot update this book');
    }

    return this.prisma.book.update({
      where: { id },
      data: dto,
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

    if (book.bookshelf.userId !== user.id) {
      throw new ForbiddenException('You cannot delete this book');
    }

    return this.prisma.book.delete({
      where: { id },
    });
  }
}
