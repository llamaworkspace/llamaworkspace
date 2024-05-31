/*
  Warnings:

  - You are about to drop the `PostSort` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PostSort" DROP CONSTRAINT "PostSort_nextId_fkey";

-- DropForeignKey
ALTER TABLE "PostSort" DROP CONSTRAINT "PostSort_postId_fkey";

-- DropForeignKey
ALTER TABLE "PostSort" DROP CONSTRAINT "PostSort_previousId_fkey";

-- DropForeignKey
ALTER TABLE "PostSort" DROP CONSTRAINT "PostSort_userId_fkey";

-- DropTable
DROP TABLE "PostSort";
