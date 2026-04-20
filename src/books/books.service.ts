import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, User } from '../users/users.service';

export interface Book {
  id: number;
  title: string;
  author: string;
  status: 'TO_READ' | 'READING' | 'DONE';
  userId: number;
}

type CreateBookInput = Pick<Book, 'title' | 'author' | 'status'>;
type UpdateBookInput = Partial<CreateBookInput>;

@Injectable()
export class BooksService {
  private readonly books: Book[] = [];

  create(dto: CreateBookInput, user: User) {
    const book: Book = {
      id: Date.now(),
      title: dto.title,
      author: dto.author,
      status: dto.status,
      userId: user.id,
    };

    this.books.push(book);
    return book;
  }

  findMyBooks(user: User) {
    return this.books.filter((book) => book.userId === user.id);
  }

  findAll(user: User) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    return this.books;
  }

  update(id: number, dto: UpdateBookInput, user: User) {
    const book = this.books.find((b) => b.id === id);

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (book.userId !== user.id) {
      throw new ForbiddenException('You cannot update this book');
    }

    Object.assign(book, dto);
    return book;
  }

  remove(id: number, user: User) {
    const index = this.books.findIndex((b) => b.id === id);

    if (index === -1) {
      throw new NotFoundException('Book not found');
    }

    if (this.books[index].userId !== user.id) {
      throw new ForbiddenException('You cannot delete this book');
    }

    return this.books.splice(index, 1)[0];
  }
}
