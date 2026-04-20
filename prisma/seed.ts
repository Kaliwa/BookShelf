import 'dotenv/config';
import { PrismaClient, Role, BookStatus } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

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
    ],
  });

  console.log('Seed terminé');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
