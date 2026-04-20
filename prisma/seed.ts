import { PrismaClient, Role, BookStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

type BookshelfRecord = {
  id: number;
  userId: number;
  name: string;
};

type UserWithBookshelf = {
  id: number;
  email: string;
  role: Role;
  bookshelf: BookshelfRecord;
};

type UserDelegate = {
  upsert(args: {
    where: { email: string };
    update: {
      role: Role;
      isEmailVerified: boolean;
    };
    create: {
      email: string;
      password: string;
      role: Role;
      isEmailVerified: boolean;
      bookshelf: {
        create: {
          name: string;
        };
      };
    };
  }): Promise<UserWithBookshelf>;
};

type BookshelfDelegate = {
  upsert(args: {
    where: { userId: number };
    update: {
      name: string;
    };
    create: {
      userId: number;
      name: string;
    };
  }): Promise<BookshelfRecord>;
};

type SeedDatabase = {
  user: UserDelegate;
  bookshelf: BookshelfDelegate;
  book: PrismaClient['book'];
};

const database = prisma as unknown as SeedDatabase;

async function ensureUserWithBookshelf(params: {
  email: string;
  password: string;
  role: Role;
  bookshelfName: string;
}) {
  const user = await database.user.upsert({
    where: { email: params.email },
    update: {
      role: params.role,
      isEmailVerified: true,
    },
    create: {
      email: params.email,
      password: params.password,
      role: params.role,
      isEmailVerified: true,
      bookshelf: {
        create: {
          name: params.bookshelfName,
        },
      },
    },
  });

  const bookshelf = await database.bookshelf.upsert({
    where: { userId: user.id },
    update: {
      name: params.bookshelfName,
    },
    create: {
      userId: user.id,
      name: params.bookshelfName,
    },
  });

  return { user, bookshelf };
}

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('123456', 10);

  await ensureUserWithBookshelf({
    email: 'admin@test.com',
    password: adminPassword,
    role: Role.ADMIN,
    bookshelfName: 'Admin Central Shelf',
  });

  const user1 = await ensureUserWithBookshelf({
    email: 'alice@test.com',
    password: userPassword,
    role: Role.USER,
    bookshelfName: 'Alice Cozy Shelf',
  });

  const user2 = await ensureUserWithBookshelf({
    email: 'bob@test.com',
    password: userPassword,
    role: Role.USER,
    bookshelfName: 'Bob Tech Shelf',
  });

  const user3 = await ensureUserWithBookshelf({
    email: 'charlie@test.com',
    password: userPassword,
    role: Role.USER,
    bookshelfName: 'Charlie Productive Shelf',
  });

  const user4 = await ensureUserWithBookshelf({
    email: 'diana@test.com',
    password: userPassword,
    role: Role.USER,
    bookshelfName: 'Diana Architecture Shelf',
  });

  const user5 = await ensureUserWithBookshelf({
    email: 'eric@test.com',
    password: userPassword,
    role: Role.USER,
    bookshelfName: 'Eric Learning Shelf',
  });

  await prisma.book.deleteMany();
  await prisma.book.createMany({
    data: [
      {
        title: 'Le Petit Prince',
        author: 'Antoine de Saint-Exupéry',
        status: BookStatus.DONE,
        bookshelfId: user1.bookshelf.id,
      },
      {
        title: '1984',
        author: 'George Orwell',
        status: BookStatus.READING,
        bookshelfId: user1.bookshelf.id,
      },
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        status: BookStatus.TO_READ,
        bookshelfId: user2.bookshelf.id,
      },
      {
        title: 'Sapiens',
        author: 'Yuval Noah Harari',
        status: BookStatus.DONE,
        bookshelfId: user2.bookshelf.id,
      },
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        status: BookStatus.READING,
        bookshelfId: user3.bookshelf.id,
      },
      {
        title: 'Deep Work',
        author: 'Cal Newport',
        status: BookStatus.TO_READ,
        bookshelfId: user3.bookshelf.id,
      },
      {
        title: 'The Pragmatic Programmer',
        author: 'Andrew Hunt',
        status: BookStatus.DONE,
        bookshelfId: user3.bookshelf.id,
      },
      {
        title: 'Refactoring',
        author: 'Martin Fowler',
        status: BookStatus.TO_READ,
        bookshelfId: user4.bookshelf.id,
      },
      {
        title: 'Domain-Driven Design',
        author: 'Eric Evans',
        status: BookStatus.READING,
        bookshelfId: user4.bookshelf.id,
      },
      {
        title: 'Designing Data-Intensive Applications',
        author: 'Martin Kleppmann',
        status: BookStatus.TO_READ,
        bookshelfId: user4.bookshelf.id,
      },
      {
        title: 'The Clean Coder',
        author: 'Robert C. Martin',
        status: BookStatus.DONE,
        bookshelfId: user5.bookshelf.id,
      },
      {
        title: 'Grokking Algorithms',
        author: 'Aditya Bhargava',
        status: BookStatus.READING,
        bookshelfId: user5.bookshelf.id,
      },
      {
        title: "You Don't Know JS Yet",
        author: 'Kyle Simpson',
        status: BookStatus.TO_READ,
        bookshelfId: user5.bookshelf.id,
      },
      {
        title: 'Eloquent JavaScript',
        author: 'Marijn Haverbeke',
        status: BookStatus.DONE,
        bookshelfId: user1.bookshelf.id,
      },
      {
        title: 'The Mythical Man-Month',
        author: 'Frederick P. Brooks Jr.',
        status: BookStatus.TO_READ,
        bookshelfId: user2.bookshelf.id,
      },
      {
        title: 'Code Complete',
        author: 'Steve McConnell',
        status: BookStatus.READING,
        bookshelfId: user5.bookshelf.id,
      },
    ],
  });

  console.log('Seed termine avec un jeu de donnees etendu');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
