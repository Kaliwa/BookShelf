-- DropForeignKey
ALTER TABLE "Book" DROP CONSTRAINT "Book_userId_fkey";

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "userId",
ADD COLUMN     "bookshelfId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Bookshelf" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'My Bookshelf',
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bookshelf_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bookshelf_userId_key" ON "Bookshelf"("userId");

-- AddForeignKey
ALTER TABLE "Bookshelf" ADD CONSTRAINT "Bookshelf_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_bookshelfId_fkey" FOREIGN KEY ("bookshelfId") REFERENCES "Bookshelf"("id") ON DELETE CASCADE ON UPDATE CASCADE;
