import { PrismaPg } from '@prisma/adapter-pg';
import { BookStatus, PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function ensureUser(email: string, password: string, role: Role) {
  return prisma.user.upsert({
    where: { email },
    update: {
      role,
      isEmailVerified: true,
      password,
    },
    create: {
      email,
      password,
      role,
      isEmailVerified: true,
    },
  });
}

async function createShelf(userId: number, name: string) {
  return prisma.bookshelf.create({
    data: {
      userId,
      name,
    },
  });
}

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('123456', 10);

  const admin = await ensureUser('admin@test.com', adminPassword, Role.ADMIN);
  const alice = await ensureUser('alice@test.com', userPassword, Role.USER);
  const bob = await ensureUser('bob@test.com', userPassword, Role.USER);
  const charlie = await ensureUser('charlie@test.com', userPassword, Role.USER);

  const users = [admin, alice, bob, charlie];
  const userIds = users.map((user) => user.id);

  await prisma.book.deleteMany({
    where: {
      bookshelf: {
        userId: { in: userIds },
      },
    },
  });

  await prisma.bookshelf.deleteMany({
    where: {
      userId: { in: userIds },
    },
  });

  const shelves = {
    aliceFiction: await createShelf(alice.id, 'Alice Fiction'),
    aliceWork: await createShelf(alice.id, 'Alice Work'),
    bobTech: await createShelf(bob.id, 'Bob Tech'),
    bobPersonal: await createShelf(bob.id, 'Bob Personal'),
    charlieBusiness: await createShelf(charlie.id, 'Charlie Business'),
    charlieLearning: await createShelf(charlie.id, 'Charlie Learning'),
    adminGlobal: await createShelf(admin.id, 'Admin Global'),
  };

  await prisma.book.createMany({
    data: [
      {
        title: 'Le Petit Prince',
        author: 'Antoine de Saint-Exupery',
        status: BookStatus.DONE,
        bookshelfId: shelves.aliceFiction.id,
      },
      {
        title: '1984',
        author: 'George Orwell',
        status: BookStatus.READING,
        bookshelfId: shelves.aliceFiction.id,
      },
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        status: BookStatus.TO_READ,
        bookshelfId: shelves.aliceWork.id,
      },
      {
        title: 'Domain-Driven Design',
        author: 'Eric Evans',
        status: BookStatus.READING,
        bookshelfId: shelves.bobTech.id,
      },
      {
        title: 'Designing Data-Intensive Applications',
        author: 'Martin Kleppmann',
        status: BookStatus.TO_READ,
        bookshelfId: shelves.bobTech.id,
      },
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        status: BookStatus.DONE,
        bookshelfId: shelves.bobPersonal.id,
      },
      {
        title: 'The Lean Startup',
        author: 'Eric Ries',
        status: BookStatus.READING,
        bookshelfId: shelves.charlieBusiness.id,
      },
      {
        title: 'Deep Work',
        author: 'Cal Newport',
        status: BookStatus.TO_READ,
        bookshelfId: shelves.charlieLearning.id,
      },
      {
        title: 'Refactoring',
        author: 'Martin Fowler',
        status: BookStatus.TO_READ,
        bookshelfId: shelves.adminGlobal.id,
      },
    ],
  });

  console.log('Seed complete: users, bookshelves, and books created.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
