import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateBookshelfDto } from './dto/update-bookshelf.dto';

type BookshelfRecord = {
  id: number;
  userId: number;
  name: string;
};

interface BookshelfDelegate {
  upsert(args: {
    where: { userId: number };
    update: Record<string, never>;
    create: { userId: number; name: string };
  }): Promise<BookshelfRecord>;
  findUnique(args: {
    where: { id: number };
    include: {
      user: {
        select: {
          id: true;
          email: true;
          role: true;
        };
      };
      books: {
        orderBy: { id: 'desc' };
      };
    };
  }): Promise<BookshelfRecord | null>;
  update(args: {
    where: { id: number };
    data: { name: string };
    include: {
      books: true;
    };
  }): Promise<BookshelfRecord>;
  findMany(args: {
    orderBy: { id: 'desc' };
    include: {
      user: {
        select: {
          id: true;
          email: true;
          role: true;
        };
      };
      books: {
        orderBy: { id: 'desc' };
      };
    };
  }): Promise<BookshelfRecord[]>;
}

@Injectable()
export class BookshelfService {
  constructor(private readonly prisma: PrismaService) {}

  private get bookshelf() {
    return this.prisma as PrismaService & { bookshelf: BookshelfDelegate };
  }

  private getOrCreateBookshelf(user: User): Promise<BookshelfRecord> {
    return this.bookshelf.bookshelf.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        name: `${user.email.split('@')[0]}'s bookshelf`,
      },
    });
  }

  async getMyBookshelf(user: User) {
    const bookshelf = await this.getOrCreateBookshelf(user);

    return this.bookshelf.bookshelf.findUnique({
      where: { id: bookshelf.id },
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

  async updateMyBookshelf(user: User, dto: UpdateBookshelfDto) {
    const bookshelf = await this.getOrCreateBookshelf(user);

    return this.bookshelf.bookshelf.update({
      where: { id: bookshelf.id },
      data: { name: dto.name },
      include: {
        books: true,
      },
    });
  }

  findAll() {
    return this.bookshelf.bookshelf.findMany({
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
