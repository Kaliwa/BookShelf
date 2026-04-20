import 'dotenv/config';
import { PrismaClient, Role, BookStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password: adminPassword,
      role: Role.ADMIN,
      isEmailVerified: true,
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: 'alice@test.com' },
    update: {},
    create: {
      email: 'alice@test.com',
      password: userPassword,
      role: Role.USER,
      isEmailVerified: true,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@test.com' },
    update: {},
    create: {
      email: 'bob@test.com',
      password: userPassword,
      role: Role.USER,
      isEmailVerified: true,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'charlie@test.com' },
    update: {},
    create: {
      email: 'charlie@test.com',
      password: userPassword,
      role: Role.USER,
      isEmailVerified: true,
    },
  });

  const user4 = await prisma.user.upsert({
    where: { email: 'diana@test.com' },
    update: {},
    create: {
      email: 'diana@test.com',
      password: userPassword,
      role: Role.USER,
      isEmailVerified: true,
    },
  });

  const user5 = await prisma.user.upsert({
    where: { email: 'eric@test.com' },
    update: {},
    create: {
      email: 'eric@test.com',
      password: userPassword,
      role: Role.USER,
      isEmailVerified: true,
    },
  });

  await prisma.book.deleteMany();
  await prisma.book.createMany({
    data: [
      {
        title: 'Le Petit Prince',
        author: 'Antoine de Saint-Exupéry',
        status: BookStatus.DONE,
        userId: user1.id,
      },
      {
        title: '1984',
        author: 'George Orwell',
        status: BookStatus.READING,
        userId: user1.id,
      },
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        status: BookStatus.TO_READ,
        userId: user2.id,
      },
      {
        title: 'Sapiens',
        author: 'Yuval Noah Harari',
        status: BookStatus.DONE,
        userId: user2.id,
      },
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        status: BookStatus.READING,
        userId: user3.id,
      },
      {
        title: 'Deep Work',
        author: 'Cal Newport',
        status: BookStatus.TO_READ,
        userId: user3.id,
      },
      {
        title: 'The Pragmatic Programmer',
        author: 'Andrew Hunt',
        status: BookStatus.DONE,
        userId: user3.id,
      },
      {
        title: 'Refactoring',
        author: 'Martin Fowler',
        status: BookStatus.TO_READ,
        userId: user4.id,
      },
      {
        title: 'Domain-Driven Design',
        author: 'Eric Evans',
        status: BookStatus.READING,
        userId: user4.id,
      },
      {
        title: 'Designing Data-Intensive Applications',
        author: 'Martin Kleppmann',
        status: BookStatus.TO_READ,
        userId: user4.id,
      },
      {
        title: 'The Clean Coder',
        author: 'Robert C. Martin',
        status: BookStatus.DONE,
        userId: user5.id,
      },
      {
        title: 'Grokking Algorithms',
        author: 'Aditya Bhargava',
        status: BookStatus.READING,
        userId: user5.id,
      },
      {
        title: 'You Don\'t Know JS Yet',
        author: 'Kyle Simpson',
        status: BookStatus.TO_READ,
        userId: user5.id,
      },
      {
        title: 'Eloquent JavaScript',
        author: 'Marijn Haverbeke',
        status: BookStatus.DONE,
        userId: user1.id,
      },
      {
        title: 'The Mythical Man-Month',
        author: 'Frederick P. Brooks Jr.',
        status: BookStatus.TO_READ,
        userId: user2.id,
      },
      {
        title: 'Code Complete',
        author: 'Steve McConnell',
        status: BookStatus.READING,
        userId: user5.id,
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
