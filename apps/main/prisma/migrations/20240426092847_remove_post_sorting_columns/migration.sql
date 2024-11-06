/*
  Warnings:

  - You are about to drop the column `previousId` on the `Post` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_previousId_fkey";

-- DropIndex
DROP INDEX "Post_previousId_key";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "previousId";
