import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { BookStatus, Role } from '@prisma/client';
import { BooksService } from './books.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BooksService', () => {
  let service: BooksService;
  let prisma: {
    book: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    bookshelf: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
    };
  };

  const user = {
    id: 1,
    email: 'alice@example.com',
    password: 'secret',
    role: Role.USER,
    isEmailVerified: true,
  };
  const admin = {
    ...user,
    id: 2,
    email: 'admin@example.com',
    role: Role.ADMIN,
  };

  beforeEach(async () => {
    prisma = {
      book: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      bookshelf: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('updates a book status while keeping bookshelfId when provided', async () => {
    prisma.book.findUnique.mockResolvedValue({
      id: 10,
      title: 'Old title',
      author: 'Old author',
      status: BookStatus.TO_READ,
      bookshelfId: 3,
      bookshelf: {
        id: 3,
        userId: user.id,
      },
    });
    prisma.bookshelf.findUnique.mockResolvedValue({
      id: 3,
      userId: user.id,
      name: 'Mes livres',
    });
    prisma.book.update.mockResolvedValue({
      id: 10,
      title: 'Old title',
      author: 'Old author',
      status: BookStatus.DONE,
      bookshelfId: 3,
    });

    await service.update(10, { status: BookStatus.DONE, bookshelfId: 3 }, user);

    expect(prisma.book.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: {
        title: undefined,
        author: undefined,
        status: BookStatus.DONE,
        bookshelfId: 3,
      },
    });
  });

  it('rejects moving a book to another user bookshelf', async () => {
    prisma.book.findUnique.mockResolvedValue({
      id: 10,
      bookshelf: {
        id: 3,
        userId: user.id,
      },
    });
    prisma.bookshelf.findUnique.mockResolvedValue({
      id: 99,
      userId: 999,
      name: 'Autre shelf',
    });

    await expect(
      service.update(10, { bookshelfId: 99 }, user),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('allows an admin to move a book to another user bookshelf', async () => {
    prisma.book.findUnique.mockResolvedValue({
      id: 10,
      bookshelf: {
        id: 3,
        userId: user.id,
      },
    });
    prisma.bookshelf.findUnique.mockResolvedValue({
      id: 99,
      userId: 999,
      name: 'Autre shelf',
    });
    prisma.book.update.mockResolvedValue({
      id: 10,
      bookshelfId: 99,
      status: BookStatus.DONE,
    });

    await service.update(10, { bookshelfId: 99 }, admin);

    expect(prisma.book.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: {
        title: undefined,
        author: undefined,
        status: undefined,
        bookshelfId: 99,
      },
    });
  });

  it('allows an admin to delete another user book', async () => {
    prisma.book.findUnique.mockResolvedValue({
      id: 10,
      bookshelf: {
        id: 3,
        userId: user.id,
      },
    });
    prisma.book.delete = jest.fn().mockResolvedValue({ id: 10 });

    await service.remove(10, admin);

    expect(prisma.book.delete).toHaveBeenCalledWith({
      where: { id: 10 },
    });
  });
});
